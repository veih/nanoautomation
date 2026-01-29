/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import Image from "next/image";
import {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import { toast } from "react-toastify";
import { CorretivaConcluida, CorretivasStatus, Colaborador } from "../../../../types";

// Local hooks to replace lib/hooks (removed due to infinite callback issues)
function useFetch<T>(url: string, options: { immediate?: boolean } = {}) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            // Handle both standardized and legacy response formats
            if (
                typeof result === "object" &&
                result !== null &&
                "success" in result
            ) {
                if (!result.success) {
                    throw new Error(result.error?.message || "API Error");
                }
                setData(result.data || null);
            } else {
                setData(result);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Erro ao carregar dados";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (options.immediate !== false) {
            fetchData();
        }
    }, [fetchData, options.immediate]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}

function useForm<T>(
    initialValues: T,
    validate?: (values: T) => Record<string, string>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setValue = useCallback((field: keyof T, value: unknown) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        // We'll handle error clearing separately to avoid dependency issues
    }, []);

    const clearError = useCallback((field: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const setErrorsCallback = useCallback((newErrors: Record<string, string>) => {
        setErrors(newErrors);
    }, []);

    const handleSubmit = useCallback(
        (onSubmit: (values: T) => void | Promise<void>) => {
            return async (e?: React.FormEvent) => {
                if (e) e.preventDefault();

                const validationErrors = validate ? validate(values) : {};
                setErrorsCallback(validationErrors);

                if (Object.keys(validationErrors).length === 0) {
                    await onSubmit(values);
                }
            };
        },
        [setErrorsCallback, validate, values]
    );

    const validateForm = useCallback(() => {
        const validationErrors = validate ? validate(values) : {};
        setErrorsCallback(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [validate, values, setErrorsCallback]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    return {
        values,
        errors,
        setValue,
        clearError,
        handleSubmit,
        validateForm,
        reset,
        setErrors: setErrorsCallback,
    };
}

function useAsyncOperation() {
    const [loading, setLoading] = useState(false);

    const execute = useCallback(
        async (
            operation: () => Promise<unknown>,
            options: { successMessage?: string; errorMessage?: string } = {}
        ) => {
            setLoading(true);
            try {
                const result = await operation();
                if (options.successMessage) {
                    toast.success(options.successMessage);
                }
                return result;
            } catch (error: unknown) {
                const message =
                    error instanceof Error
                        ? error.message
                        : options.errorMessage || "Erro na operação";
                toast.error(message);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        execute,
        loading,
    };
}

import { corretivaSchema } from "../../../../lib/validations";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";

interface Props {
    show: boolean;
    onHide: () => void;
    editData: CorretivaConcluida | null;
    colaboradores: Colaborador[];
    onSaved: () => void;
}

const API_CORRETIVAS = "/api/corretivas";

export default function CorretivaConcluidaFormModal({
    show,
    onHide,
    editData,
    colaboradores: propsColaboradores,
    onSaved,
}: Props) {
    const isEdit = Boolean(editData);
    const { execute: executeOperation, loading } = useAsyncOperation();

    // Get colaboradores data with fallback
    const { data: colaboradoresResponse } = useFetch<{ data: Colaborador[] }>(
        "/api/colaboradores",
        {
            immediate: !propsColaboradores.length,
        }
    );
    const colaboradores =
        propsColaboradores.length > 0
            ? propsColaboradores
            : colaboradoresResponse?.data || [];

    // Stable initial values
    const initialFormValues = useMemo(
        () => ({
            data: "",
            descricao: "",
            local: "",
            colaborador: "",
            solicitacao: "",
            solicitante: "",
            status: CorretivasStatus.CONCLUIDO,
            dataConclusao: "",
            sistema: "",
            categoria: "",
        }),
        []
    );

    // Form management with validation
    const {
        values: formValues,
        errors: formErrors,
        handleSubmit,
        setValue,
        clearError,
        reset: resetForm,
    } = useForm(initialFormValues, (values) => {
        // Convert to API format for validation
        const apiValues = {
            ...values,
            data: values.data ? new Date(values.data).toISOString() : "",
            dataConclusao: values.dataConclusao ? new Date(values.dataConclusao).toISOString() : "",
            status: values.status as CorretivasStatus,
        };

        const result = corretivaSchema.safeParse(apiValues);
        if (result.success) return {};

        const errors: Record<string, string> = {};
        result.error.issues.forEach((err: any) => {
            const path = err.path.join(".");
            errors[path] = err.message;
        });
        return errors;
    });

    // Update setValue to also clear errors
    const setValueWithClearError = useCallback(
        (field: keyof typeof initialFormValues, value: unknown) => {
            setValue(field, value);
            clearError(field as string);
        },
        [setValue, clearError]
    );

    // Initialize form data when editData changes
    useEffect(() => {
        if (editData) {
            setValueWithClearError("data", editData.data.split("T")[0]);
            setValueWithClearError("descricao", editData.descricao);
            setValueWithClearError("local", editData.local);
            setValueWithClearError("colaborador", editData.colaborador || "");
            setValueWithClearError("solicitacao", editData.solicitacao);
            setValueWithClearError("solicitante", editData.solicitante);
            setValueWithClearError("status", editData.status);
            setValueWithClearError("dataConclusao", editData.dataConclusao ? editData.dataConclusao.split("T")[0] : "");
            setValueWithClearError("sistema", editData.sistema || "");
            setValueWithClearError("categoria", editData.categoria || "");
        } else {
            resetForm();
        }
    }, [editData, setValueWithClearError, resetForm]);

    // Photo preview URLs
    const photoPreviewUrls = useMemo(() => {
        return editData?.fotos?.map(f => f.url) || [];
    }, [editData]);

    // Form submission
    const onSubmit = handleSubmit(async (formData) => {
        await executeOperation(
            async () => {
                const dataToSend = new FormData();

                // Add form data
                Object.entries(formData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        dataToSend.append(key, value as string);
                    }
                });

                // For completed corretivas, ensure status is CONCLUIDO
                dataToSend.set("status", CorretivasStatus.CONCLUIDO);

                const url = isEdit
                    ? `${API_CORRETIVAS}/${editData?.id}`
                    : API_CORRETIVAS;
                const method = isEdit ? "PUT" : "POST";

                const res = await fetch(url, { method, body: dataToSend });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Erro ao salvar corretiva");
                }

                onSaved();
                onHide();
                return res.json();
            },
            {
                successMessage: isEdit
                    ? "Corretiva atualizada com sucesso!"
                    : "Corretiva criada com sucesso!",
                errorMessage: "Erro ao salvar corretiva",
            }
        );
    });

    const locais = [
        "CMs",
        "Lojas",
        "Estacionamento",
        "ATs",
        "Sala de Segurança",
        "Subestações",
        "Teatro",
    ];

    const sistemas = [
        "Energia",
        "SCA", 
        "SCP",
        "SDAI",
        "Outros"
    ];

    const categoriasPorSistema: Record<string, string[]> = {
        "Energia": [
            "Gestal",
            "Medidor de energia",
            "Fonte de energia",
            "Rede"
        ],
        "SCA": [
            "Analise de sistema de controle de acesso",
            "Backup",
            "W Acess",
            "Botão de requisição de saida",
            "Cadastro de cartão offline",
            "Cadastro de usuário",
            "Eletroímã",
            "Fixação",
            "Leitora",
            "Rede",
            "Serviço"
        ],
        "SCP": [
            "Sensores de Segurança",
            "Sensores de Automação",
            "Atuador",
            "Inversor de frequencia",
            "Controlador NR",
            "Criar alarme",
            "Falha de acionamento",
            "Iluminação",
            "Programação horária",
            "Rede"
        ],
        "SDAI": [
            "Acionamento manual",
            "Alarme indevido",
            "Backup",
            "Central de incêndio",
            "Chave de fluxo",
            "Detector",
            "Fixação de despositivo",
            "Interligação de loja",
            "Laço em curto ou aberto",
            "Modulo",
            "Nomeclatura de dispositivo",
            "Rebot Buster",
            "Repetidora",
            "Sirene",
            "Teste de acionamento",
            "Valvula solenoide"
        ],
        "Outros": [
            "Manutenção Predial",
            "Infraestrutura TI",
            "Rede/Cabeamento",
            "Equipamentos Diversos",
            "Sistema de Áudio",
            "Controle Ambiental",
            "Outros Equipamentos"
        ]
    };

    return (
        <ComponentErrorBoundary componentName="Formulário de Corretiva Concluída">
            <Modal show={show} onHide={onHide} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-pencil me-2"></i>
                        Editar Corretiva Concluída
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={onSubmit} className="form-enhanced">
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="data" className="mb-3">
                                    <Form.Label>
                                        Data <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formValues.data}
                                        onChange={(e) =>
                                            setValueWithClearError("data", e.target.value)
                                        }
                                        isInvalid={!!formErrors.data}
                                        required
                                        disabled={isEdit} // Prevent editing for existing records
                                    />
                                    {formErrors.data && (
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.data}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="dataConclusao" className="mb-3">
                                    <Form.Label>
                                        Data de Conclusão <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formValues.dataConclusao}
                                        onChange={(e) =>
                                            setValueWithClearError("dataConclusao", e.target.value)
                                        }
                                        isInvalid={!!formErrors.dataConclusao}
                                        required
                                        disabled={isEdit} // Prevent editing for existing records
                                    />
                                    {formErrors.dataConclusao && (
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.dataConclusao}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group controlId="local" className="mb-3">
                            <Form.Label>
                                Local <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                value={formValues.local}
                                onChange={(e) =>
                                    setValueWithClearError("local", e.target.value)
                                }
                                isInvalid={!!formErrors.local}
                                required
                            >
                                <option value="">Selecione um local</option>
                                {locais.map((l) => (
                                    <option key={l} value={l}>
                                        {l}
                                    </option>
                                ))}
                            </Form.Select>
                            {formErrors.local && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.local}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="sistema" className="mb-3">
                                    <Form.Label>Sistema</Form.Label>
                                    <Form.Select
                                        value={formValues.sistema}
                                        onChange={(e) => {
                                            setValueWithClearError("sistema", e.target.value);
                                            // Limpa a categoria quando muda o sistema
                                            setValueWithClearError("categoria", "");
                                        }}
                                        isInvalid={!!formErrors.sistema}
                                    >
                                        <option value="">Selecione um sistema</option>
                                        {sistemas.map((sistema) => (
                                            <option key={sistema} value={sistema}>
                                                {sistema}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {formErrors.sistema && (
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.sistema}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group controlId="categoria" className="mb-3">
                            <Form.Label>Categoria</Form.Label>
                            <Form.Select
                                value={formValues.categoria}
                                onChange={(e) =>
                                    setValueWithClearError("categoria", e.target.value)
                                }
                                isInvalid={!!formErrors.categoria}
                                disabled={!formValues.sistema}
                            >
                                <option value="">
                                    {formValues.sistema 
                                        ? "Selecione uma categoria" 
                                        : "Selecione primeiro um sistema"}
                                </option>
                                {formValues.sistema && categoriasPorSistema[formValues.sistema]?.map((categoria) => (
                                    <option key={categoria} value={categoria}>
                                        {categoria}
                                    </option>
                                ))}
                            </Form.Select>
                            {formErrors.categoria && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.categoria}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group controlId="colaborador" className="mb-3">
                            <Form.Label>
                                Colaborador <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                value={formValues.colaborador}
                                onChange={(e) =>
                                    setValueWithClearError("colaborador", e.target.value)
                                }
                                isInvalid={!!formErrors.colaborador}
                                required
                            >
                                <option value="">Selecione um colaborador</option>
                                {colaboradores.map((c) => (
                                    <option key={c.id} value={c.nome}>
                                        {c.nome}
                                    </option>
                                ))}
                            </Form.Select>
                            {formErrors.colaborador && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.colaborador}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group controlId="solicitante" className="mb-3">
                            <Form.Label>
                                Solicitante <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={formValues.solicitante}
                                onChange={(e) =>
                                    setValueWithClearError("solicitante", e.target.value)
                                }
                                isInvalid={!!formErrors.solicitante}
                                placeholder="Nome do solicitante"
                                required
                            />
                            {formErrors.solicitante && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.solicitante}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group controlId="solicitacao" className="mb-3">
                            <Form.Label>
                                Solicitação <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formValues.solicitacao}
                                onChange={(e) =>
                                    setValueWithClearError("solicitacao", e.target.value)
                                }
                                isInvalid={!!formErrors.solicitacao}
                                placeholder="Descreva a solicitação..."
                                required
                            />
                            {formErrors.solicitacao && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.solicitacao}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group controlId="descricao" className="mb-3">
                            <Form.Label>
                                Descrição <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formValues.descricao}
                                onChange={(e) =>
                                    setValueWithClearError("descricao", e.target.value)
                                }
                                isInvalid={!!formErrors.descricao}
                                placeholder="Descreva detalhadamente o problema..."
                                required
                            />
                            {formErrors.descricao && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.descricao}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {/* Photo Display - Read Only */}
                        <Form.Group className="mb-3">
                            <Form.Label>Fotos da Corretiva</Form.Label>
                            <p className="text-muted">
                                <i className="bi bi-info-circle me-1"></i>
                                As fotos não podem ser editadas para corretivas concluídas.
                            </p>

                            {photoPreviewUrls.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {photoPreviewUrls.map((url, i) => (
                                        <div key={i} className="position-relative">
                                            <Image
                                                src={url}
                                                alt={`Foto ${i + 1}`}
                                                width={120}
                                                height={120}
                                                style={{ objectFit: "cover" }}
                                                className="rounded border shadow-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {photoPreviewUrls.length === 0 && (
                                <div className="text-center py-3 bg-light rounded">
                                    <i className="bi bi-image text-muted" style={{ fontSize: "2rem" }}></i>
                                    <p className="text-muted mt-2 mb-0">Nenhuma foto disponível</p>
                                </div>
                            )}
                        </Form.Group>

                        {editData?.dataConclusao && (
                            <Form.Group className="mb-3">
                                <Form.Label>Data Conclusão</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={new Date(editData.dataConclusao).toLocaleString("pt-BR", {
                                        timeZone: "America/Fortaleza",
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })}
                                    readOnly
                                />
                            </Form.Group>
                        )}
                        {/* {editData?.dataEdicao && (
                          <Form.Group className="mb-3">
                            <Form.Label>Última Edição</Form.Label>
                            <Form.Control
                              type="text"
                              value={new Date(editData.dataEdicao).toLocaleString("pt-BR", {
                                timeZone: "America/Fortaleza",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                              readOnly
                            />
                          </Form.Group>
                        )} */}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide} disabled={loading}>
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="btn-enhanced"
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check me-2"></i>
                                    Atualizar
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </ComponentErrorBoundary>
    );
}