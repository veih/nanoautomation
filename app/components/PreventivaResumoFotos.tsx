// app/components/PreventivaResumoFotos.tsx
// Summary component showing photo completion by LUC

import { Card, Badge, ProgressBar } from "react-bootstrap";

interface FotoResumo {
    lojaLUC: string;
    lojaNome: string;
    totalItens: number;
    itensComFoto: number;
    fotosPorTipo: {
        SENSOR_TEMPERATURA: number;
        SENSOR_MOVIMENTO: number;
        BOTAO_PANICO: number;
        QUADRO_AUTOMACAO: number;
    };
    ultimaAtualizacao: string;
    tecnico: string;
}

interface ResumoFotosProps {
    dados: FotoResumo[];
}

export default function PreventivaResumoFotos({ dados }: ResumoFotosProps) {
    const getProgressVariant = (percentual: number) => {
        if (percentual >= 100) return "success";
        if (percentual >= 75) return "info";
        if (percentual >= 50) return "warning";
        return "danger";
    };

    const getTipoIcon = (tipo: keyof FotoResumo['fotosPorTipo']) => {
        const icons = {
            SENSOR_TEMPERATURA: "thermometer",
            SENSOR_MOVIMENTO: "activity",
            BOTAO_PANICO: "exclamation-triangle",
            QUADRO_AUTOMACAO: "cpu"
        };
        return icons[tipo];
    };

    const getTipoColor = (tipo: keyof FotoResumo['fotosPorTipo']) => {
        const colors = {
            SENSOR_TEMPERATURA: "info",
            SENSOR_MOVIMENTO: "warning",
            BOTAO_PANICO: "danger",
            QUADRO_AUTOMACAO: "primary"
        };
        return colors[tipo];
    };

    if (dados.length === 0) {
        return (
            <Card>
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        <i className="bi bi-bar-chart me-2"></i>
                        Resumo de Fotos por LUC
                    </h5>
                </Card.Header>
                <Card.Body className="text-center py-5">
                    <i className="bi bi-image" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <p className="mt-3 text-muted">Nenhum dado de fotos disponível</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Resumo de Fotos por LUC
                </h5>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>LUC</th>
                                <th>Loja</th>
                                <th>Progresso Geral</th>
                                <th>Detalhamento por Tipo</th>
                                <th>Última Atualização</th>
                                <th>Técnico</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map((item, index) => {
                                const percentual = (item.itensComFoto / item.totalItens) * 100;

                                return (
                                    <tr key={index}>
                                        <td>
                                            <strong className="text-primary">{item.lojaLUC}</strong>
                                        </td>
                                        <td>{item.lojaNome}</td>
                                        <td>
                                            <div>
                                                <div className="d-flex justify-content-between small mb-1">
                                                    <span>{item.itensComFoto}/{item.totalItens} fotos</span>
                                                    <span>{Math.round(percentual)}%</span>
                                                </div>
                                                <ProgressBar
                                                    variant={getProgressVariant(percentual)}
                                                    now={percentual}
                                                    style={{ height: '8px' }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {Object.entries(item.fotosPorTipo).map(([tipo, quantidade]) => (
                                                    <div key={tipo} className="d-flex align-items-center">
                                                        <Badge
                                                            bg={getTipoColor(tipo as keyof FotoResumo['fotosPorTipo'])}
                                                            className="d-inline-flex align-items-center"
                                                        >
                                                            <i className={`bi bi-${getTipoIcon(tipo as keyof FotoResumo['fotosPorTipo'])} me-1`}></i>
                                                            {quantidade}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {new Date(item.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                                            </small>
                                        </td>
                                        <td>
                                            <Badge bg="secondary">{item.tecnico}</Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Summary Statistics */}
                <div className="row mt-4 pt-3 border-top">
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="display-6 text-primary">{dados.length}</div>
                            <div className="small text-muted">Lojas Ativas</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="display-6 text-success">
                                {dados.reduce((sum, item) => sum + item.itensComFoto, 0)}
                            </div>
                            <div className="small text-muted">Fotos Totais</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="display-6 text-info">
                                {Math.round(dados.reduce((sum, item) => sum + (item.itensComFoto / item.totalItens) * 100, 0) / dados.length)}%
                            </div>
                            <div className="small text-muted">Média de Conclusão</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="display-6 text-warning">
                                {dados.filter(item => item.itensComFoto === item.totalItens).length}
                            </div>
                            <div className="small text-muted">Lojas Completas</div>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}