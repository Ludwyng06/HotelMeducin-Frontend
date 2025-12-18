'use client';

import React, { useEffect, useRef, useState } from 'react';
import { neo4jService, GraphNode, GraphRelationship } from '../../services/neo4jService';
import '../../styles/Neo4jGraph.css';


export default function Neo4jGraphPage() {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphRelationship | null>(null);
  const [showCreateNode, setShowCreateNode] = useState(false);
  const [showCreateRelationship, setShowCreateRelationship] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeProperties, setNewNodeProperties] = useState<Record<string, any>>({});
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [relationshipData, setRelationshipData] = useState({
    fromLabel: '',
    fromId: '',
    relationshipType: '',
    toLabel: '',
    toId: '',
  });
  const [availableNodes, setAvailableNodes] = useState<GraphNode[]>([]);

  useEffect(() => {
    loadGraph();
  }, []);

  useEffect(() => {
    if (networkRef.current && nodes.length > 0) {
      initializeNetwork();
    }
  }, [nodes, edges]);

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const graphData = await neo4jService.getGraph();
      
      // Transformar nodos para vis-network
      const visNodes = graphData.nodes.map((node: GraphNode) => ({
        id: node.id,
        label: node.labels.join(', ') || 'Node',
        group: node.labels[0] || 'default',
        title: JSON.stringify(node.properties, null, 2),
        ...node.properties,
      }));

      // Transformar relaciones para vis-network
      const visEdges = graphData.relationships.map((rel: GraphRelationship) => ({
        id: rel.id,
        from: rel.from,
        to: rel.to,
        label: rel.type,
        arrows: 'to',
        title: JSON.stringify(rel.properties, null, 2),
      }));

      setNodes(visNodes);
      setEdges(visEdges);
    } catch (err: any) {
      console.error('Error cargando grafo:', err);
      setError(err.message || 'Error al cargar el grafo');
    } finally {
      setLoading(false);
    }
  };

  const initializeNetwork = async () => {
    if (!networkRef.current || networkInstanceRef.current) return;
    if (typeof window === 'undefined') return;

    try {
      // Cargar vis-network dinámicamente
      const visNetwork = await import('vis-network/standalone');
      const { Network } = visNetwork;

      const data = {
        nodes: nodes,
        edges: edges,
      };

      const options = {
        nodes: {
          shape: 'dot',
          size: 16,
          font: {
            size: 14,
            color: '#333',
          },
          borderWidth: 2,
          shadow: true,
        },
        edges: {
          width: 2,
          color: { color: '#848484' },
          smooth: {
            enabled: true,
            type: 'continuous',
            roundness: 0.5,
          },
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 1.2,
            },
          },
          font: {
            size: 12,
            align: 'middle',
          },
        },
        physics: {
          enabled: true,
          stabilization: {
            iterations: 200,
          },
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          zoomView: true,
          dragView: true,
        },
      };

      const network = new Network(networkRef.current, data, options);

      // Eventos del grafo
      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodes.find((n: any) => n.id === nodeId);
          if (node) {
            setSelectedNode({
              id: node.id,
              labels: node.group ? [node.group] : [],
              properties: node,
            } as GraphNode);
          }
        } else if (params.edges.length > 0) {
          const edgeId = params.edges[0];
          const edge = edges.find((e: any) => e.id === edgeId);
          if (edge) {
            setSelectedEdge({
              id: edge.id,
              type: edge.label,
              from: edge.from,
              to: edge.to,
              properties: {},
            } as GraphRelationship);
          }
        } else {
          setSelectedNode(null);
          setSelectedEdge(null);
        }
      });

      networkInstanceRef.current = network;
    } catch (err) {
      console.error('Error inicializando red:', err);
      setError('Error al inicializar la visualización del grafo');
    }
  };

  const handleCreateNode = async () => {
    try {
      await neo4jService.createNode({
        label: newNodeLabel,
        properties: newNodeProperties,
      });
      setShowCreateNode(false);
      setNewNodeLabel('');
      setNewNodeProperties({});
      await loadGraph();
    } catch (err: any) {
      setError(err.message || 'Error al crear nodo');
    }
  };

  const handleSyncAuto = async () => {
    try {
      setSyncStatus('Sincronizando...');
      await neo4jService.syncAuto();
      setSyncStatus('Sincronización completada');
      await loadGraph();
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al sincronizar');
      setSyncStatus(null);
    }
  };

  const handleCreateRelationship = async () => {
    try {
      await neo4jService.createRelationship(relationshipData);
      setShowCreateRelationship(false);
      setRelationshipData({
        fromLabel: '',
        fromId: '',
        relationshipType: '',
        toLabel: '',
        toId: '',
      });
      await loadGraph();
    } catch (err: any) {
      setError(err.message || 'Error al crear relación');
    }
  };

  const loadAvailableNodes = async () => {
    try {
      const userNodes = await neo4jService.getAllNodes('User');
      const roomNodes = await neo4jService.getAllNodes('Room');
      const reservationNodes = await neo4jService.getAllNodes('Reservation');
      setAvailableNodes([...userNodes, ...roomNodes, ...reservationNodes]);
    } catch (err) {
      console.error('Error cargando nodos disponibles:', err);
    }
  };

  useEffect(() => {
    if (showCreateRelationship) {
      loadAvailableNodes();
    }
  }, [showCreateRelationship]);

  if (loading) {
    return (
      <div className="neo4j-container">
        <div className="loading">Cargando grafo...</div>
      </div>
    );
  }

  return (
    <div className="neo4j-container">
      <div className="neo4j-header">
        <h1>🔷 Visualización de Grafos Neo4j</h1>
        <div className="neo4j-actions">
          <button onClick={loadGraph} className="btn-refresh">
            🔄 Actualizar Grafo
          </button>
          <button onClick={handleSyncAuto} className="btn-sync">
            🔄 Sincronizar desde MongoDB
          </button>
          <button onClick={() => setShowCreateNode(true)} className="btn-create">
            ➕ Crear Nodo
          </button>
          <button onClick={() => setShowCreateRelationship(true)} className="btn-create">
            🔗 Crear Relación
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="sync-status">{syncStatus}</div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="neo4j-content">
        <div className="graph-container" ref={networkRef}></div>

        <div className="neo4j-sidebar">
          {selectedNode && (
            <div className="info-panel">
              <h3>Nodo Seleccionado</h3>
              <div className="info-content">
                <p><strong>ID:</strong> {selectedNode.id}</p>
                <p><strong>Labels:</strong> {selectedNode.labels.join(', ')}</p>
                <h4>Propiedades:</h4>
                <pre>{JSON.stringify(selectedNode.properties, null, 2)}</pre>
              </div>
            </div>
          )}

          {selectedEdge && (
            <div className="info-panel">
              <h3>Relación Seleccionada</h3>
              <div className="info-content">
                <p><strong>ID:</strong> {selectedEdge.id}</p>
                <p><strong>Tipo:</strong> {selectedEdge.type}</p>
                <p><strong>Desde:</strong> {selectedEdge.from}</p>
                <p><strong>Hacia:</strong> {selectedEdge.to}</p>
              </div>
            </div>
          )}

          {!selectedNode && !selectedEdge && (
            <div className="info-panel">
              <h3>Información</h3>
              <p>Haz clic en un nodo o relación para ver sus detalles</p>
              <p><strong>Nodos:</strong> {nodes.length}</p>
              <p><strong>Relaciones:</strong> {edges.length}</p>
            </div>
          )}
        </div>
      </div>

      {showCreateNode && (
        <div className="modal-overlay" onClick={() => setShowCreateNode(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nuevo Nodo</h2>
            <div className="form-group">
              <label>Label:</label>
              <input
                type="text"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="Ej: User, Room, Reservation"
              />
            </div>
            <div className="form-group">
              <label>Propiedades (JSON):</label>
              <textarea
                value={JSON.stringify(newNodeProperties, null, 2)}
                onChange={(e) => {
                  try {
                    setNewNodeProperties(JSON.parse(e.target.value));
                  } catch {
                    // Ignorar errores de parsing mientras se escribe
                  }
                }}
                placeholder='{"name": "valor", "id": "123"}'
                rows={5}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCreateNode} className="btn-primary">
                Crear
              </button>
              <button onClick={() => setShowCreateNode(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateRelationship && (
        <div className="modal-overlay" onClick={() => setShowCreateRelationship(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nueva Relación</h2>
            <div className="form-group">
              <label>Desde (Label):</label>
              <input
                type="text"
                value={relationshipData.fromLabel}
                onChange={(e) => setRelationshipData({ ...relationshipData, fromLabel: e.target.value })}
                placeholder="Ej: User"
              />
            </div>
            <div className="form-group">
              <label>Desde (ID):</label>
              <input
                type="text"
                value={relationshipData.fromId}
                onChange={(e) => setRelationshipData({ ...relationshipData, fromId: e.target.value })}
                placeholder="ID del nodo origen"
              />
            </div>
            <div className="form-group">
              <label>Tipo de Relación:</label>
              <input
                type="text"
                value={relationshipData.relationshipType}
                onChange={(e) => setRelationshipData({ ...relationshipData, relationshipType: e.target.value })}
                placeholder="Ej: RESERVÓ, PERTENECE_A"
              />
            </div>
            <div className="form-group">
              <label>Hacia (Label):</label>
              <input
                type="text"
                value={relationshipData.toLabel}
                onChange={(e) => setRelationshipData({ ...relationshipData, toLabel: e.target.value })}
                placeholder="Ej: Reservation"
              />
            </div>
            <div className="form-group">
              <label>Hacia (ID):</label>
              <input
                type="text"
                value={relationshipData.toId}
                onChange={(e) => setRelationshipData({ ...relationshipData, toId: e.target.value })}
                placeholder="ID del nodo destino"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCreateRelationship} className="btn-primary">
                Crear Relación
              </button>
              <button onClick={() => setShowCreateRelationship(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

