'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import API from '@services/api';

interface GraphNode {
  id: string;
  label: string;
  group?: string;
  type?: string;
  properties?: any;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  relationships?: GraphEdge[];
}

interface GraphVisualizationProps {
  userId?: string;
  limit?: number;
  height?: string;
  showControls?: boolean;
  refreshKey?: number; // Key para forzar recarga del grafo
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  userId,
  limit = 100,
  height = '600px',
  showControls = true,
  refreshKey = 0,
}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = '/neo4j/graph/visualization';
        if (userId) {
          endpoint = `/neo4j/graph/user/${userId}`;
          console.log('🔍 Cargando grafo para usuario:', userId);
        } else {
          endpoint += `?limit=${limit}`;
          console.log('🔍 Cargando grafo completo (límite:', limit, ')');
        }

        console.log('🌐 Llamando endpoint:', endpoint);
        const response = await API.get(endpoint);
        
        console.log('📊 Respuesta del endpoint:', {
          success: response.data.success,
          message: response.data.message,
          hasData: !!response.data.data,
          nodesCount: response.data.data?.nodes?.length || 0,
          edgesCount: response.data.data?.edges?.length || response.data.data?.relationships?.length || 0
        });
        
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          
          console.log('📊 Datos recibidos:', {
            nodesCount: data.nodes?.length || 0,
            edgesCount: data.edges?.length || data.relationships?.length || 0,
            hasNodes: !!data.nodes,
            hasEdges: !!(data.edges || data.relationships),
            nodes: data.nodes?.slice(0, 3) // Primeros 3 nodos para debug
          });
          
          // Convertir relaciones a edges si es necesario
          const edges = data.edges || data.relationships || [];
          
          // Verificar que hay nodos
          if (!data.nodes || data.nodes.length === 0) {
            console.warn('⚠️ No hay nodos en los datos recibidos');
            console.warn('⚠️ Esto puede significar que:');
            console.warn('   1. El usuario no está sincronizado en Neo4j');
            console.warn('   2. El usuario no tiene reservaciones');
            console.warn('   3. Los datos no están sincronizados correctamente');
            setGraphData({
              nodes: [],
              edges: [],
            });
            return;
          }
          
          setGraphData({
            nodes: data.nodes || [],
            edges: edges,
          });
          
          console.log('✅ Grafo cargado exitosamente:', {
            totalNodes: data.nodes.length,
            totalEdges: edges.length
          });
        } else {
          const errorMsg = response.data.message || 'Error al cargar el grafo';
          console.error('❌ Error en respuesta:', errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        console.error('❌ Error cargando grafo:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          userId: userId
        });
        setError(err.response?.data?.message || err.message || 'Error al cargar el grafo');
      } finally {
        setLoading(false);
      }
    };

    loadGraphData();
  }, [userId, limit, refreshKey]);

  useEffect(() => {
    if (!networkRef.current || !graphData || graphData.nodes.length === 0) {
      return;
    }

    // Destruir instancia anterior si existe
    if (networkInstanceRef.current) {
      try {
        networkInstanceRef.current.destroy();
      } catch (error) {
        console.warn('Error al destruir instancia anterior de Network:', error);
      }
      networkInstanceRef.current = null;
    }

    // Limpiar el contenedor antes de crear una nueva instancia
    if (networkRef.current) {
      networkRef.current.innerHTML = '';
    }

    // Configurar colores por tipo de nodo y status
    const nodeColors: Record<string, string> = {
      user: '#3b82f6',           // Azul para usuarios
      reservation: '#10b981',     // Verde por defecto para reservaciones
      reservation_pending: '#3b82f6',    // Azul para pendientes
      reservation_confirmed: '#10b981',  // Verde para confirmadas
      reservation_cancelled: '#ef4444',  // Rojo para canceladas
      reservation_completed: '#059669',  // Verde oscuro para completadas
      reservation_expired: '#f59e0b',    // Amarillo para expiradas
      room: '#f59e0b',            // Amarillo para habitaciones
    };

    const nodeGroups: Record<string, string> = {
      User: 'user',
      Reservation: 'reservation',
      Room: 'room',
    };

    // Función para obtener el color según el tipo y status
    const getNodeColor = (node: any): string => {
      const baseGroup = node.group || nodeGroups[node.type || ''] || 'user';
      
      // Si es una reservación, usar color según status
      if (node.type === 'Reservation' || baseGroup === 'reservation') {
        // Normalizar status a minúsculas para consistencia
        const rawStatus = node.properties?.status || 'pending';
        const status = rawStatus.toLowerCase();
        const colorKey = `reservation_${status}`;
        const color = nodeColors[colorKey] || nodeColors.reservation;
        
        // Debug para reservaciones confirmadas
        if (status === 'confirmed' || rawStatus === 'confirmed' || rawStatus === 'CONFIRMED') {
          console.log(`🎨 [getNodeColor] Reservación confirmada detectada:`, {
            nodeId: node.id,
            rawStatus,
            normalizedStatus: status,
            colorKey,
            color,
            properties: node.properties
          });
        }
        
        // Log si no se encuentra el color correcto
        if (!nodeColors[colorKey] && status !== 'pending') {
          console.warn(`⚠️ [getNodeColor] Color no encontrado para status: ${status}, usando color por defecto: ${color}`);
        }
        
        return color;
      }
      
      return nodeColors[baseGroup] || '#6b7280';
    };

    // Detectar el tema actual (claro u oscuro)
    const isDarkTheme = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Función para determinar el color del texto según el color de fondo y el tema
    const getTextColor = (backgroundColor: string, nodeType?: string): string => {
      // Lógica específica para nodos de tipo User
      if (nodeType === 'User') {
        // En tema oscuro (azul), usar texto blanco
        if (isDarkTheme) {
          return '#ffffff'; // Blanco en tema oscuro
        }
        // En tema claro (blanco), usar texto negro
        return '#000000'; // Negro en tema claro
      }
      
      // Para otros nodos, mantener la lógica original
      // En tema blanco (claro), siempre usar texto negro para máxima visibilidad
      if (!isDarkTheme) {
        return '#000000'; // Negro puro en tema blanco
      }
      
      // En tema oscuro (azul), usar la lógica original con texto blanco
      // Normalizar el color a minúsculas para comparación
      const bgColor = backgroundColor.toLowerCase();
      
      // Colores oscuros que necesitan texto blanco con borde (tema oscuro)
      const darkColors = [
        '#3b82f6', // Azul usuario
        '#1e40af', // Azul oscuro
        '#10b981', // Verde confirmada
        '#059669', // Verde oscuro completada
        '#ef4444', // Rojo cancelada
        '#dc2626', // Rojo oscuro
        '#000000', // Negro
        '#1f2937', // Gris muy oscuro
      ];
      
      // Colores claros que necesitan texto negro (solo para amarillo en tema oscuro)
      const lightColors = [
        '#f59e0b', // Amarillo habitación (claro - necesita texto negro)
        '#fbbf24', // Amarillo claro
        '#fcd34d', // Amarillo muy claro
      ];
      
      // Si es un color claro (solo amarillo), usar texto negro
      if (lightColors.includes(bgColor)) {
        return '#000000';
      }
      
      // Para todos los demás colores en tema oscuro, usar texto blanco (como estaba antes)
      return '#ffffff';
    };

    // Preparar nodos para vis-network
    const nodes = graphData.nodes.map((node) => {
      const nodeColor = getNodeColor(node);
      const textColor = getTextColor(nodeColor, node.type);
      
      return {
        id: node.id,
        label: node.label || node.id,
        color: {
          background: nodeColor,
          border: textColor === '#ffffff' ? '#ffffff' : '#1f2937',
          highlight: {
            background: nodeColor,
            border: '#000000',
          },
        },
        shape: node.type === 'User' ? 'dot' : node.type === 'Reservation' ? 'diamond' : 'box',
        size: node.type === 'User' ? 20 : node.type === 'Reservation' ? 15 : 25,
        font: {
          size: 13,
          color: textColor,
          face: 'Arial',
          strokeWidth: textColor === '#ffffff' ? 2 : 0,
          strokeColor: textColor === '#ffffff' ? '#000000' : undefined,
        },
        title: `${node.type || 'Nodo'}\n${JSON.stringify(node.properties || {}, null, 2)}`,
      };
    });

    // Preparar edges para vis-network
    const edges = graphData.edges.map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      label: edge.label || edge.type || '',
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.8,
        },
      },
      color: {
        color: '#6b7280',
        highlight: '#3b82f6',
      },
      width: 2,
      font: {
        size: 11,
        color: '#1f2937',
        face: 'Arial',
        strokeWidth: 3,
        strokeColor: '#ffffff',
        align: 'middle',
      },
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0.2,
      },
    }));

    const data = { nodes, edges };

    const options = {
      nodes: {
        borderWidth: 2,
        shadow: true,
        font: {
          size: 12,
          face: 'Arial',
        },
      },
      edges: {
        width: 2,
        shadow: true,
        font: {
          size: 11,
          align: 'middle',
          color: '#1f2937',
          face: 'Arial',
          strokeWidth: 3,
          strokeColor: '#ffffff',
        },
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.2,
        },
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 200,
        },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true,
        dragView: true,
      },
      layout: {
        improvedLayout: true,
      },
    };

    // Crear instancia de la red solo si el contenedor existe y está vacío
    if (networkRef.current) {
      try {
        const network = new Network(networkRef.current, data, options);
        networkInstanceRef.current = network;
      } catch (error) {
        console.error('Error al crear instancia de Network:', error);
      }
    }

    // Limpiar al desmontar o cuando cambien los datos
    return () => {
      if (networkInstanceRef.current) {
        try {
          networkInstanceRef.current.destroy();
        } catch (error) {
          console.warn('Error al destruir Network en cleanup:', error);
        }
        networkInstanceRef.current = null;
      }
    };
  }, [graphData]);

  const handleFit = () => {
    if (networkInstanceRef.current) {
      networkInstanceRef.current.fit();
    }
  };

  const handleZoomIn = () => {
    if (networkInstanceRef.current) {
      const scale = networkInstanceRef.current.getScale();
      networkInstanceRef.current.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkInstanceRef.current) {
      const scale = networkInstanceRef.current.getScale();
      networkInstanceRef.current.moveTo({ scale: scale * 0.8 });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>⏳</div>
          <div>Cargando grafo...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--color-error)' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>❌</div>
          <div>{error}</div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: 'var(--color-text-light)' }}>
            {userId ? 'No hay datos del grafo para este usuario' : 'No hay datos del grafo disponibles'}
          </div>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>📊</div>
          <div style={{ marginBottom: '8px', fontWeight: 600, color: 'var(--color-text)' }}>No hay datos para visualizar</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-light)', marginBottom: '12px' }}>
            {userId 
              ? 'Este usuario no tiene reservaciones sincronizadas en Neo4j. Las reservaciones se sincronizan automáticamente cuando se crean.'
              : 'No hay datos sincronizados en Neo4j. Ejecuta la sincronización desde el panel de administración.'}
          </div>
          {userId && (
            <div style={{ fontSize: '11px', marginTop: '8px', color: 'var(--color-text-light)', background: '#f3f4f6', padding: '8px', borderRadius: '6px', maxWidth: '500px', margin: '8px auto 0' }}>
              💡 <strong>Solución:</strong> Crea una reservación para que se sincronice automáticamente con Neo4j, o ejecuta la sincronización manual desde el panel de administración.
            </div>
          )}
          {!userId && (
            <div style={{ fontSize: '11px', marginTop: '8px', color: 'var(--color-text-light)' }}>
              💡 Usa: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>npm run sync:neo4j</code>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {showControls && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <button
            onClick={handleZoomIn}
            style={{
              padding: '6px 12px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title="Acercar"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            style={{
              padding: '6px 12px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title="Alejar"
          >
            −
          </button>
          <button
            onClick={handleFit}
            style={{
              padding: '6px 12px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title="Ajustar vista"
          >
            ⛶
          </button>
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '16px 18px',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        fontSize: '13px',
        minWidth: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ marginBottom: '14px', fontWeight: 'bold', fontSize: '14px', color: '#1f2937' }}>Elementos del Grafo:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: '#3b82f6',
              border: '2px solid #1e40af',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
              flexShrink: 0
            }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Usuario</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#10b981',
              transform: 'rotate(45deg)',
              border: '2px solid #059669',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
              flexShrink: 0
            }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Reservación (Confirmada)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#3b82f6',
              transform: 'rotate(45deg)',
              border: '2px solid #1e40af',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
              flexShrink: 0
            }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Reservación (Pendiente)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#ef4444',
              transform: 'rotate(45deg)',
              border: '2px solid #dc2626',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
              flexShrink: 0
            }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Reservación (Cancelada)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#f59e0b',
              border: '2px solid #d97706',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
              flexShrink: 0
            }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Habitación</span>
          </div>
        </div>
      </div>

      <div
        ref={networkRef}
        style={{
          width: '100%',
          height: height,
          background: 'var(--color-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}
      />
    </div>
  );
};

export default GraphVisualization;

