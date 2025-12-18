import API from './api';

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  from: string;
  to: string;
  properties: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface CreateNodeData {
  label: string;
  properties?: Record<string, any>;
}

export interface CreateRelationshipData {
  fromLabel: string;
  fromId: string;
  relationshipType: string;
  toLabel: string;
  toId: string;
  properties?: Record<string, any>;
}

class Neo4jService {
  async getGraph(): Promise<GraphData> {
    const response = await API.get('/neo4j/graph');
    return response.data.data;
  }

  async getAllNodes(label: string) {
    const response = await API.get(`/neo4j/nodes/${label}`);
    return response.data.data;
  }

  async getNodeById(label: string, id: string) {
    const response = await API.get(`/neo4j/nodes/${label}/${id}`);
    return response.data.data;
  }

  async createNode(data: CreateNodeData) {
    const response = await API.post('/neo4j/nodes', data);
    return response.data.data;
  }

  async updateNode(label: string, id: string, properties: Record<string, any>) {
    const response = await API.post(`/neo4j/nodes/${label}/${id}`, properties);
    return response.data.data;
  }

  async deleteNode(label: string, id: string) {
    const response = await API.delete(`/neo4j/nodes/${label}/${id}`);
    return response.data;
  }

  async createRelationship(data: CreateRelationshipData) {
    const response = await API.post('/neo4j/relationships', data);
    return response.data.data;
  }

  async deleteRelationship(data: CreateRelationshipData) {
    const response = await API.delete('/neo4j/relationships', { data });
    return response.data;
  }

  async getNodeRelationships(label: string, id: string) {
    const response = await API.get(`/neo4j/nodes/${label}/${id}/relationships`);
    return response.data.data;
  }

  async syncAuto() {
    const response = await API.post('/neo4j/sync/auto');
    return response.data;
  }
}

export const neo4jService = new Neo4jService();
