/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Card, Row, Col, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

import LojaNavigationSubmenu from "../../../components/navigation/LojaNavigationSubmenu";
import { CmsTableSkeleton } from "../../../components/Loading";
import { ComponentErrorBoundary } from "../../../components/ErrorBoundary";
import { FireDetectionEquipmentLoja } from "../../../../types";

// Simple local hooks to replace lib/hooks (removed due to infinite callback issues)
function useModal() {
    const [isOpen, setIsOpen] = useState(false);
    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    };
}

function useForm<T>(
    initialValues: T,
    validate?: (values: T) => Record<string, string>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setValue = useCallback(
        (field: keyof T, value: unknown) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            if (errors[field as string]) {
                setErrors((prev) => ({ ...prev, [field as string]: "" }));
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        (onSubmit: (values: T) => void | Promise<void>) => {
            return async (e?: React.FormEvent) => {
                if (e) e.preventDefault();

                const validationErrors = validate ? validate(values) : {};
                setErrors(validationErrors);

                if (Object.keys(validationErrors).length === 0) {
                    await onSubmit(values);
                }
            };
        },
        [values, validate]
    );

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    return {
        values,
        errors,
        setValue,
        handleSubmit,
        reset,
    };
}

// Import shared components and utilities
import {
    DataTable,
    FormModal,
    ConfirmDeleteModal,
    PageHeader,
    useCrudOperations,
    useFilterAndSort,
    useLojas,
    useFireDetectionEquipment,
    fireDetectionEquipmentFormSchema,
    FireDetectionEquipmentFormData,
} from "../shared";

export default function FireDetectionEquipmentPage() {
    const router = useRouter();
    // Data fetching
    const { lojas, loading: loadingLojas, error: errorLojas } = useLojas();
    const {
        equipment,
        loading: loadingEquipment,
        error: errorEquipment,
        refetch,
    } = useFireDetectionEquipment();

    // Stable refetch reference to prevent infinite loops in useCrudOperations
    const stableRefetch = useCallback(() => {
        refetch();
    }, [refetch]);

    // CRUD operations
    const {
        selectedItem: editData,
        setSelectedItem: setEditData,
        operationLoading,
        saveItem,
        deleteItem,
    } = useCrudOperations<FireDetectionEquipmentLoja>({
        apiEndpoint: "/api/lojasApi/fire-detection-equipment",
        entityName: "Equipamento de Detecção",
        getItemName: (equipment) => equipment.nome,
        onSuccess: stableRefetch,
    });

    // Modal states
    const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
    const {
        isOpen: showConfirmModal,
        open: openConfirmModal,
        close: closeConfirmModal,
    } = useModal();

    // Local state
    const [equipmentToDelete, setEquipmentToDelete] = useState<FireDetectionEquipmentLoja | null>(null);
    const [searchText, setSearchText] = useState("");

    // Form management
    const {
        values: formValues,
        errors: formErrors,
        handleSubmit,
        setValue,
        reset: resetForm,
    } = useForm<FireDetectionEquipmentFormData>(
        {
            nome: "",
            tipo: "",
            modelo: "",
            existe: true,
            lojaId: "",
            comissionada: false,
            tipoLoja: "",
            lacoDetec: "",
            v24Dc2: false,
            stGas: false,
            cmdAlarme: false,
            stAlarme: false,
            stFalha: false,
        },
        (values) => {
            const result = fireDetectionEquipmentFormSchema.safeParse(values);
            if (result.success) return {};

            const errors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                const path = err.path.join(".");
                errors[path] = err.message;
            });
            return errors;
        }
    );

    // Loading and error states
    const loading = loadingEquipment || loadingLojas;
    const error = errorEquipment || errorLojas;

    // Associate equipment with their lojas
    const equipmentComLojas = useMemo(() => {
        return equipment.map((item) => ({
            ...item,
            loja: lojas.find((loja) => loja.id === item.lojaId),
        }));
    }, [equipment, lojas]);

    // Filtered and sorted data
    const filteredEquipment = useFilterAndSort(
        equipmentComLojas,
        searchText,
        ["nome", "tipo"],
        {
            primaryField: "nome" as keyof (typeof equipmentComLojas)[0],
        }
    );

    // Statistics calculations
    const stats = useMemo(() => {
        if (!equipment)
            return {
                total: 0,
                existentes: 0,
                naoExistentes: 0,
                comissionadas: 0,
            };

        const total = equipment.length;
        const existentes = equipment.filter((e) => e.existe).length;
        const naoExistentes = equipment.filter((e) => !e.existe).length;
        const comissionadas = equipment.filter((e) => e.comissionada).length;

        return {
            total,
            existentes,
            naoExistentes,
            comissionadas,
        };
    }, [equipment]);

    // Table configuration
    const tableColumns = useMemo(
        () => [
            {
                key: "nome",
                header: "Nome",
            },
            {
                key: "tipo",
                header: "Tipo",
            },
            {
                key: "modelo",
                header: "Modelo",
                render: (item: FireDetectionEquipmentLoja) => item.modelo || "N/A",
            },
            {
                key: "loja",
                header: "Loja",
                render: (item: FireDetectionEquipmentLoja) =>
                    item.loja ? `${item.loja.nome} (${item.loja.LUC})` : "N/A",
            },
            {
                key: "existe",
                header: "Existe",
                render: (item: FireDetectionEquipmentLoja) => (
                    <span className={`badge ${item.existe ? "bg-success" : "bg-danger"}`}>
                        {item.existe ? "Sim" : "Não"}
                    </span>
                ),
            },
            {
                key: "comissionada",
                header: "Comissionada",
                render: (item: FireDetectionEquipmentLoja) => (
                    <span className={`badge ${item.comissionada ? "bg-success" : "bg-warning"}`}>
                        {item.comissionada ? "Sim" : "Não"}
                    </span>
                ),
            },
        ],
        []
    );

    const formFields = useMemo(
        () => [
            {
                name: "nome",
                label: "Nome do Equipamento",
                required: true,
            },
            {
                name: "tipo",
                label: "Tipo",
                required: true,
            },
            {
                name: "modelo",
                label: "Modelo",
            },
            {
                name: "lojaId",
                label: "Loja",
                type: "select" as const,
                options: lojas.map((loja) => ({
                    value: loja.id,
                    label: `${loja.nome} (${loja.LUC})`,
                })),
                required: true,
            },
            {
                name: "existe",
                label: "Existe",
                type: "checkbox" as const,
            },
            {
                name: "comissionada",
                label: "Comissionada",
                type: "checkbox" as const,
            },
            {
                name: "tipoLoja",
                label: "Tipo de Loja",
            },
            {
                name: "lacoDetec",
                label: "Laço de Detecção",
            },
            {
                name: "v24Dc2",
                label: "V24 DC2",
                type: "checkbox" as const,
            },
            {
                name: "stGas",
                label: "Status Gás",
                type: "checkbox" as const,
            },
            {
                name: "cmdAlarme",
                label: "Comando de Alarme",
                type: "checkbox" as const,
            },
            {
                name: "stAlarme",
                label: "Status de Alarme",
                type: "checkbox" as const,
            },
            {
                name: "stFalha",
                label: "Status de Falha",
                type: "checkbox" as const,
            },
        ],
        [lojas]
    );

    // Event handlers
    const handleNewEquipment = useCallback(() => {
        setEditData(null);
        resetForm();
        openModal();
    }, [resetForm, openModal, setEditData]);

    const handleEditEquipment = useCallback(
        (equipment: FireDetectionEquipmentLoja) => {
            setEditData(equipment);
            openModal();
        },
        [openModal, setEditData]
    );

    const handleDeleteEquipment = useCallback(
        (equipment: FireDetectionEquipmentLoja) => {
            setEquipmentToDelete(equipment);
            openConfirmModal();
        },
        [openConfirmModal]
    );

    const handleViewDetails = useCallback(
        (equipment: FireDetectionEquipmentLoja) => {
            router.push(`/pages/lojas/detalhes?id=${equipment.lojaId}`);
        },
        [router]
    );

    const handleCloseConfirmModal = useCallback(() => {
        setEquipmentToDelete(null);
        closeConfirmModal();
    }, [closeConfirmModal]);

    const confirmDelete = useCallback(async () => {
        if (!equipmentToDelete) return;
        await deleteItem(equipmentToDelete);
        handleCloseConfirmModal();
    }, [equipmentToDelete, deleteItem, handleCloseConfirmModal]);

    // Form handlers
    const fecharModal = useCallback(() => {
        setEditData(null);
        resetForm();
        closeModal();
    }, [resetForm, closeModal, setEditData]);

    const onSubmit = handleSubmit(async (formData) => {
        const isEdit = Boolean(editData);
        await saveItem(formData, isEdit);
        fecharModal();
    });

    // Initialize form when editing
    useEffect(() => {
        if (editData) {
            setValue("nome", editData.nome);
            setValue("tipo", editData.tipo);
            setValue("modelo", editData.modelo || "");
            setValue("existe", editData.existe);
            setValue("lojaId", editData.lojaId);
            setValue("comissionada", editData.comissionada);
            setValue("tipoLoja", editData.tipoLoja);
            setValue("lacoDetec", editData.lacoDetec);
            setValue("v24Dc2", editData.v24Dc2);
            setValue("stGas", editData.stGas);
            setValue("cmdAlarme", editData.cmdAlarme);
            setValue("stAlarme", editData.stAlarme);
            setValue("stFalha", editData.stFalha);
        } else {
            resetForm();
        }
    }, [editData]);

    if (loading) {
        return <CmsTableSkeleton />;
    }

    return (
        <ComponentErrorBoundary componentName="Fire Detection Equipment">
            <div className="container">
                <PageHeader
                    title="Equipamentos de Detecção de Incêndio"
                    icon="bi-fire"
                    onAddNew={handleNewEquipment}
                    addButtonLabel="Adicionar Equipamento"
                    searchValue={searchText}
                    onSearchChange={setSearchText}
                    searchPlaceholder="Digite o nome do equipamento ou tipo..."
                >
                    <LojaNavigationSubmenu isCollapsed={false} />
                    <ToastContainer position="top-right" autoClose={2000} />
                </PageHeader>

                {/* Statistics Cards */}
                <Card className="mb-4 shadow">
                    <Card.Body>
                        <Row className="mb-4 g-3">
                            <Col xs={6} md={3}>
                                <Card className="bg-primary text-white h-100">
                                    <Card.Body className="text-center">
                                        <i className="bi bi-fire" style={{ fontSize: "2rem" }}></i>
                                        <Card.Title className="h6 mt-2">Total</Card.Title>
                                        <Card.Text className="fs-4 fw-bold">
                                            {stats.total}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} md={3}>
                                <Card className="bg-success text-white h-100">
                                    <Card.Body className="text-center">
                                        <i
                                            className="bi bi-check-circle"
                                            style={{ fontSize: "2rem" }}
                                        ></i>
                                        <Card.Title className="h6 mt-2">Existentes</Card.Title>
                                        <Card.Text className="fs-4 fw-bold">
                                            {stats.existentes}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} md={3}>
                                <Card className="bg-danger text-white h-100">
                                    <Card.Body className="text-center">
                                        <i
                                            className="bi bi-x-circle"
                                            style={{ fontSize: "2rem" }}
                                        ></i>
                                        <Card.Title className="h6 mt-2">Não Existentes</Card.Title>
                                        <Card.Text className="fs-4 fw-bold">
                                            {stats.naoExistentes}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} md={3}>
                                <Card className="bg-warning text-dark h-100">
                                    <Card.Body className="text-center">
                                        <i className="bi bi-tools" style={{ fontSize: "2rem" }}></i>
                                        <Card.Title className="h6 mt-2">Comissionadas</Card.Title>
                                        <Card.Text className="fs-4 fw-bold">
                                            {stats.comissionadas}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {error && (
                            <Alert variant="danger" className="mb-4">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {error}
                            </Alert>
                        )}
                    </Card.Body>
                </Card>

                <DataTable
                    data={filteredEquipment}
                    columns={tableColumns}
                    error={error}
                    emptyMessage="Nenhum equipamento de detecção encontrado com os filtros aplicados. Adicione um novo ou ajuste os filtros!"
                    onEdit={handleEditEquipment}
                    onDelete={handleDeleteEquipment}
                    onViewDetails={handleViewDetails}
                />

                <FormModal
                    show={showModal}
                    onHide={fecharModal}
                    title={editData ? "Editar Equipamento" : "Novo Equipamento"}
                    isEdit={Boolean(editData)}
                    onSubmit={onSubmit}
                    loading={operationLoading}
                    fields={formFields}
                    values={formValues}
                    errors={formErrors}
                    onChange={(field, value) => {
                        setValue(field as keyof FireDetectionEquipmentFormData, value);
                    }}
                />

                <ConfirmDeleteModal
                    show={showConfirmModal}
                    onHide={handleCloseConfirmModal}
                    onConfirm={confirmDelete}
                    loading={operationLoading}
                    itemName="o equipamento de detecção"
                    itemIdentifier={
                        equipmentToDelete
                            ? `${equipmentToDelete.nome} (${equipmentToDelete.tipo})`
                            : ""
                    }
                    warningMessage="ATENÇÃO: Esta ação irá remover permanentemente o equipamento de detecção. Esta ação é irreversível."
                    confirmLabel="Excluir Equipamento"
                />
            </div>
        </ComponentErrorBoundary>
    );
}