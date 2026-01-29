// Modern Lojas Dashboard Component using the new architecture

"use client";

import React, { useState } from 'react';
import { Card, Button, Table, Badge, Form, Row, Col, Alert } from 'react-bootstrap';
import { 
  Building, 
  Search, 
  Plus, 
  BarChart, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useApi, usePaginatedApi, useSearch } from '@/src/hooks/useApi';
import { lojaService } from '@/src/services/LojaService';

interface Loja {
  id: string;
  nome: string;
  LUC: string;
  localizacao?: string;
  totalDefeitos: number;
  equipamentosDefeituosos: number;
  sensoresDefeituosos: number;
  atuadoresDefeituosos: number;
}

export default function LojasDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    LUC: '',
    localizacao: ''
  });

  // Fetch lojas with defect statistics
  const {
    data: lojas,
    loading: lojasLoading,
    error: lojasError,
    refetch: refetchLojas
  } = useApi<Loja[]>(() => lojaService.getAllLojasWithStats());

  // Fetch statistics
  const {
    data: stats,
    error: statsError
  } = useApi(() => lojaService.getLojaStatistics());

  // Search functionality
  const {
    data: searchResults,
    searchTerm,
    setSearchTerm,
    clearSearch,
    loading: searchLoading
  } = useSearch<Loja>((term) => 
    lojaService.searchLojas(term).then(result => result.data)
  );

  // Pagination for all lojas
  const {
    data: paginatedLojas,
    page,
    totalPages,
    totalCount,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    loading: paginationLoading
  } = usePaginatedApi<Loja>(
    (pageNum, limitNum) => lojaService.searchLojas('', pageNum, limitNum),
    { initialPage: 1, initialLimit: 10 }
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await lojaService.createLoja(formData);
      setShowCreateForm(false);
      setFormData({ nome: '', LUC: '', localizacao: '' });
      refetchLojas();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error creating loja: ${errorMessage}`);
    }
  };

  // Get data to display (search results or all lojas)
  const displayData = searchTerm ? (searchResults || []) : (paginatedLojas || lojas || []);
  const isLoading = lojasLoading || searchLoading || paginationLoading;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <Building className="me-2" />
          Gerenciamento de Lojas
        </h1>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={refetchLojas}
            disabled={isLoading}
          >
            <RefreshCw className={`me-2 ${isLoading ? 'spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="me-2" />
            Nova Loja
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="h5 mb-1">Total de Lojas</Card.Title>
                    <Card.Text className="h2 mb-0 text-primary">{stats.total}</Card.Text>
                  </div>
                  <Building size={32} className="text-primary opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="h5 mb-1">Com Defeitos</Card.Title>
                    <Card.Text className="h2 mb-0 text-danger">{stats.comDefeitos}</Card.Text>
                  </div>
                  <AlertTriangle size={32} className="text-danger opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="h5 mb-1">Sem Defeitos</Card.Title>
                    <Card.Text className="h2 mb-0 text-success">{stats.semDefeitos}</Card.Text>
                  </div>
                  <BarChart size={32} className="text-success opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="h5 mb-1">Taxa de Defeitos</Card.Title>
                    <Card.Text className="h2 mb-0 text-warning">
                      {stats.taxaDefeitos.toFixed(1)}%
                    </Card.Text>
                  </div>
                  <BarChart size={32} className="text-warning opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Search and Create Form */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Pesquisar Lojas</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={16} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nome ou LUC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={clearSearch}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </Form.Group>
            </Col>
            
            {showCreateForm && (
              <Col md={6}>
                <Form onSubmit={handleSubmit}>
                  <Row className="g-2">
                    <Col md={5}>
                      <Form.Control
                        type="text"
                        placeholder="Nome da Loja"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        required
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        placeholder="LUC"
                        value={formData.LUC}
                        onChange={(e) => setFormData({...formData, LUC: e.target.value})}
                        required
                      />
                    </Col>
                    <Col md={3}>
                      <Button type="submit" variant="success" className="w-100">
                        Criar
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Error Display */}
      {(lojasError || statsError) && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erro ao carregar dados</Alert.Heading>
          <p>{lojasError?.message || statsError?.message}</p>
          <Button variant="outline-danger" onClick={refetchLojas}>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {/* Lojas Table */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title className="mb-0">
              Lista de Lojas {searchTerm && `(Resultados para "${searchTerm}")`}
            </Card.Title>
            {!searchTerm && (
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">
                  Página {page} de {totalPages} ({totalCount} registros)
                </span>
                <div className="btn-group btn-group-sm">
                  <Button 
                    variant="outline-secondary" 
                    disabled={!hasPrevPage}
                    onClick={prevPage}
                  >
                    Anterior
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    disabled={!hasNextPage}
                    onClick={nextPage}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>LUC</th>
                  <th>Localização</th>
                  <th className="text-center">Total Defeitos</th>
                  <th className="text-center">Equipamentos</th>
                  <th className="text-center">Sensores</th>
                  <th className="text-center">Atuadores</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((loja) => (
                  <tr key={loja.id}>
                    <td className="fw-medium">{loja.nome}</td>
                    <td>{loja.LUC}</td>
                    <td>{loja.localizacao || '-'}</td>
                    <td className="text-center">
                      <Badge 
                        bg={loja.totalDefeitos > 0 ? 'danger' : 'success'}
                        pill
                      >
                        {loja.totalDefeitos}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge 
                        bg={loja.equipamentosDefeituosos > 0 ? 'danger' : 'secondary'}
                        pill
                      >
                        {loja.equipamentosDefeituosos}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge 
                        bg={loja.sensoresDefeituosos > 0 ? 'danger' : 'secondary'}
                        pill
                      >
                        {loja.sensoresDefeituosos}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge 
                        bg={loja.atuadoresDefeituosos > 0 ? 'danger' : 'secondary'}
                        pill
                      >
                        {loja.atuadoresDefeituosos}
                      </Badge>
                    </td>
                    <td className="text-center">
                      {loja.totalDefeitos > 0 ? (
                        <Badge bg="danger">Com Defeitos</Badge>
                      ) : (
                        <Badge bg="success">Operacional</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          
          {displayData.length === 0 && !isLoading && (
            <div className="text-center py-5 text-muted">
              <Building size={48} className="mb-3 opacity-50" />
              <p className="mb-0">Nenhuma loja encontrada</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}