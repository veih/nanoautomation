"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";

import LojaNavigationSubmenuProps from "../../components/navigation/LojaNavigationSubmenu";
import { CmsTableSkeleton } from "../../components/Loading";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";
import { Loja, EquipamentoLoja, AtuadorLoja, SensorLoja, AtuadorStatus, SensorStatus } from "../../../types";

// Extended interfaces to include the loja relationship
interface EquipamentoLojaWithLoja extends EquipamentoLoja {
  loja?: Loja;
  tipo?: string; // Added for Kron/VLC distinction
}

interface AtuadorLojaWithLoja extends AtuadorLoja {
  loja?: Loja;
}

interface SensorLojaWithLoja extends SensorLoja {
  loja?: Loja;
}

// Type for EquipamentoLoja status (since it's a union type, not an enum)
type EquipamentoLojaStatus = "OPERACIONAL" | "MANUTENCAO" | "DESATIVADO" | "DESCONHECIDO" | "DEFEITO";

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
      // Remove error for this field when it's updated
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    },
    []
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
  lojaFormSchema,
  LojaFormData,
  CardView, // Add CardView import
  // EnhancedDeleteModal,
} from "./shared";

// Import the new RelatedEntitiesModal component
import { RelatedEntitiesModal } from "./shared/components/RelatedEntitiesModal";
import { ViewToggle } from "./components/ViewToggle";

// Add new hooks for fetching components, actuators, and sensors
import { useAtuadoresLoja, useSensoresLoja, useEquipamentosLoja } from "./shared/hooks/useLojaData";

// Form data types for components, actuators, and sensors
interface EquipamentoFormData {
  nome: string;
  descricao?: string;
  status?: EquipamentoLojaStatus;
  lojaId?: string;
  tipo?: string; // Added to distinguish between Kron and VLC
}

interface AtuadorFormData {
  nome: string;
  tipo: string;
  estado?: AtuadorStatus;
  existe?: boolean;
  motivoNaoExiste?: string;
  lojaId?: string;
  equipamentoLojaId?: string;
}

interface SensorFormData {
  nome: string;
  tipo: "AMBIENTE" | "INSUFRAMENTO" | "MOVIMENTO" | "BOTAO_PANICO";
  estado?: SensorStatus;
  ultimaAtivacao?: string;
  existe?: boolean;
  motivoNaoExiste?: string;
  lojaId?: string;
  equipamentoLojaId?: string;
}

export default function LojasPage() {
  const router = useRouter();

  // Add a link to the simplified version at the top of the page
  useEffect(() => {
    // Check if we should redirect to simplified version
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'simplified') {
      router.push('/pages/lojas/simplified');
    }
  }, [router]);

  // Memoize initial form values to prevent infinite loops
  const initialLojaFormValues = useMemo(() => ({
    nome: "",
    LUC: "",
    localizacao: "",
    smart: "",
    idKron: "",
  }), []);

  const initialEquipamentoFormValues = useMemo(() => ({
    nome: "",
    descricao: "",
    status: "DESCONHECIDO" as EquipamentoLojaStatus,
    lojaId: "",
    tipo: "KRON", // Default to KRON
  }), []);

  const initialAtuadorFormValues = useMemo(() => ({
    nome: "",
    tipo: "",
    estado: AtuadorStatus.DESCONHECIDO,
    existe: true,
    motivoNaoExiste: "",
    lojaId: "",
    equipamentoLojaId: "",
  }), []);

  const initialSensorFormValues = useMemo(() => ({
    nome: "",
    tipo: "AMBIENTE" as "AMBIENTE" | "INSUFRAMENTO" | "MOVIMENTO" | "BOTAO_PANICO",
    estado: SensorStatus.DESCONHECIDO,
    ultimaAtivacao: "",
    existe: true,
    motivoNaoExiste: "",
    lojaId: "",
    equipamentoLojaId: "",
  }), []);

  // Data fetching
  const { lojas, loading, error, refetch } = useLojas();
  const { atuadores } = useAtuadoresLoja();
  const { sensores } = useSensoresLoja();
  const { equipamentos } = useEquipamentosLoja();

  // State for loja images (already declared above)

  // State for related entities when editing a loja
  const [lojaEquipamentos, setLojaEquipamentos] = useState<EquipamentoLoja[]>([]);
  const [lojaAtuadores, setLojaAtuadores] = useState<AtuadorLoja[]>([]);
  const [lojaSensores, setLojaSensores] = useState<SensorLoja[]>([]);
  const [loadingRelatedEntities, setLoadingRelatedEntities] = useState(false);

  // State for related entities when creating a new loja
  const [newLojaEquipamentos, setNewLojaEquipamentos] = useState<Array<Partial<EquipamentoLoja>>>([]);
  const [newLojaAtuadores, setNewLojaAtuadores] = useState<Array<Partial<AtuadorLoja>>>([]);
  const [newLojaSensores, setNewLojaSensores] = useState<Array<Partial<SensorLoja>>>([]);

  // Stable refetch reference to prevent infinite loops in useCrudOperations
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // CRUD operations for lojas
  const {
    selectedItem: editData,
    setSelectedItem: setEditData,
    operationLoading,
    saveItem,
    deleteItem,
  } = useCrudOperations<Loja>({
    apiEndpoint: "/api/lojasApi/lojas",
    entityName: "Loja",
    getItemName: (loja) => loja.nome,
    onSuccess: stableRefetch,
  });

  // CRUD operations for equipamentos
  const {
    selectedItem: editEquipamento,
    setSelectedItem: setEditEquipamento,
    operationLoading: equipamentoOperationLoading,
    saveItem: saveEquipamento,
    deleteItem: deleteEquipamento,
  } = useCrudOperations<EquipamentoLoja>({
    apiEndpoint: "/api/lojasApi/equipamentos-loja",
    entityName: "Equipamento",
    getItemName: (equip) => equip.nome,
    onSuccess: stableRefetch,
  });

  // CRUD operations for atuadores
  const {
    selectedItem: editAtuador,
    setSelectedItem: setEditAtuador,
    operationLoading: atuadorOperationLoading,
    saveItem: saveAtuador,
    deleteItem: deleteAtuador,
  } = useCrudOperations<AtuadorLoja>({
    apiEndpoint: "/api/lojasApi/atuadores-loja",
    entityName: "Atuador",
    getItemName: (atuador) => atuador.nome,
    onSuccess: stableRefetch,
  });

  // CRUD operations for sensores
  const {
    selectedItem: editSensor,
    setSelectedItem: setEditSensor,
    operationLoading: sensorOperationLoading,
    saveItem: saveSensor,
    deleteItem: deleteSensor,
  } = useCrudOperations<SensorLoja>({
    apiEndpoint: "/api/lojasApi/sensores-loja",
    entityName: "Sensor",
    getItemName: (sensor) => sensor.nome,
    onSuccess: stableRefetch,
  });

  // Modal states
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();
  const {
    isOpen: showConfirmModal,
    open: openConfirmModal,
    close: closeConfirmModal,
  } = useModal();
  const {
    isOpen: showRelatedEntitiesModal,
    open: openRelatedEntitiesModal,
    close: closeRelatedEntitiesModal,
  } = useModal();

  // Local state
  const [lojaToDelete, setLojaToDelete] = useState<Loja | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"lojas" | "equipamentos" | "atuadores" | "sensores">("lojas");
  const [entityType, setEntityType] = useState<"loja" | "equipamento" | "atuador" | "sensor">("loja");

  // Form management for lojas
  const {
    values: lojaFormValues,
    errors: lojaFormErrors,
    setValue: setLojaValue,
    reset: resetLojaForm,
  } = useForm<LojaFormData>(
    initialLojaFormValues,
    (values) => {
      const result = lojaFormSchema.safeParse(values);
      if (result.success) return {};

      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: unknown) => {
        const validationError = err as { path: string[]; message: string };
        const path = validationError.path.join(".");
        errors[path] = validationError.message;
      });
      return errors;
    }
  );

  // Form management for equipamentos
  const {
    values: equipamentoFormValues,
    errors: equipamentoFormErrors,
    setValue: setEquipamentoValue,
    reset: resetEquipamentoForm,
  } = useForm<EquipamentoFormData>(
    initialEquipamentoFormValues,
    (values) => {
      const errors: Record<string, string> = {};

      if (!values.nome || values.nome.trim() === "") {
        errors.nome = "O nome do equipamento é obrigatório";
      }

      if (!values.lojaId) {
        errors.lojaId = "A loja é obrigatória";
      }

      return errors;
    }
  );

  // Form management for atuadores
  const {
    values: atuadorFormValues,
    errors: atuadorFormErrors,
    setValue: setAtuadorValue,
    reset: resetAtuadorForm,
  } = useForm<AtuadorFormData>(
    initialAtuadorFormValues,
    (values) => {
      const errors: Record<string, string> = {};

      if (!values.nome || values.nome.trim() === "") {
        errors.nome = "O nome do atuador é obrigatório";
      }

      if (!values.tipo || values.tipo.trim() === "") {
        errors.tipo = "O tipo do atuador é obrigatório";
      }

      if (!values.lojaId) {
        errors.lojaId = "A loja é obrigatória";
      }

      return errors;
    }
  );

  // Form management for sensores
  const {
    values: sensorFormValues,
    errors: sensorFormErrors,
    setValue: setSensorValue,
    reset: resetSensorForm,
  } = useForm<SensorFormData>(
    initialSensorFormValues,
    (values) => {
      const errors: Record<string, string> = {};

      if (!values.nome || values.nome.trim() === "") {
        errors.nome = "O nome do sensor é obrigatório";
      }

      if (!values.tipo || values.tipo.trim() === "") {
        errors.tipo = "O tipo do sensor é obrigatório";
      }

      if (!values.lojaId) {
        errors.lojaId = "A loja é obrigatória";
      }

      return errors;
    }
  );

  // Filtered and sorted data
  const filteredLojas = useFilterAndSort(
    lojas,
    searchText,
    ["nome", "LUC", "localizacao", "idKron"],
    {
      primaryField: "localizacao",
      secondaryField: "LUC",
    }
  );

  // Filtered data for other tabs
  const filteredEquipamentos = useFilterAndSort(
    equipamentos as EquipamentoLojaWithLoja[],
    searchText,
    ["nome", "descricao"],
    {
      primaryField: "nome",
      secondaryField: "descricao",
    }
  );

  const filteredAtuadores = useFilterAndSort(
    atuadores as AtuadorLojaWithLoja[],
    searchText,
    ["nome", "tipo"],
    {
      primaryField: "nome",
      secondaryField: "tipo",
    }
  );

  const filteredSensores = useFilterAndSort(
    sensores as SensorLojaWithLoja[],
    searchText,
    ["nome", "tipo"],
    {
      primaryField: "nome",
      secondaryField: "tipo",
    }
  );



  // Columns for Equipamentos table
  const equipamentosColumns = useMemo(
    () => [
      {
        key: "nome",
        header: "Nome",
      },
      {
        key: "descricao",
        header: "Descrição",
        render: (equip: EquipamentoLojaWithLoja) => equip.descricao || "N/A",
      },
      {
        key: "loja",
        header: "Loja",
        render: (equip: EquipamentoLojaWithLoja) => equip.loja?.nome || "N/A",
      },
      {
        key: "status",
        header: "Status",
        render: (equip: EquipamentoLojaWithLoja) => (
          <span className={`badge bg-${equip.status === "OPERACIONAL" ? "success" :
            equip.status === "MANUTENCAO" ? "warning" :
              equip.status === "DESATIVADO" ? "secondary" :
                equip.status === "DEFEITO" ? "danger" : "info"}`}>
            {equip.status || "DESCONHECIDO"}
          </span>
        ),
      },
    ],
    []
  );

  // Columns for Atuadores table
  const atuadoresColumns = useMemo(
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
        key: "loja",
        header: "Loja",
        render: (atuador: AtuadorLojaWithLoja) => atuador.loja?.nome || "N/A",
      },
      {
        key: "estado",
        header: "Estado",
        render: (atuador: AtuadorLojaWithLoja) => (
          <span className={`badge bg-${atuador.estado === "OPERACIONAL" ? "success" :
            atuador.estado === "DEFEITO" ? "danger" :
              atuador.estado === "MANUTENCAO" ? "warning" : "secondary"}`}>
            {atuador.estado || "DESCONHECIDO"}
          </span>
        ),
      },
      {
        key: "existe",
        header: "Existe",
        render: (atuador: AtuadorLojaWithLoja) => (
          <span className={`badge bg-${atuador.existe ? "success" : "danger"}`}>
            {atuador.existe ? "Sim" : "Não"}
          </span>
        ),
      },
    ],
    []
  );

  // Columns for Sensores table
  const sensoresColumns = useMemo(
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
        key: "loja",
        header: "Loja",
        render: (sensor: SensorLojaWithLoja) => sensor.loja?.nome || "N/A",
      },
      {
        key: "estado",
        header: "Estado",
        render: (sensor: SensorLojaWithLoja) => (
          <span className={`badge bg-${sensor.estado === "OPERACIONAL" ? "success" :
            sensor.estado === "DEFEITO" ? "danger" :
              sensor.estado === "MANUTENCAO" ? "warning" : "secondary"}`}>
            {sensor.estado || "DESCONHECIDO"}
          </span>
        ),
      },
      {
        key: "ultimaAtivacao",
        header: "Última Ativação",
        render: (sensor: SensorLojaWithLoja) => sensor.ultimaAtivacao ? new Date(sensor.ultimaAtivacao).toLocaleDateString() : "N/A",
      },
    ],
    []
  );

  const formFields = useMemo(
    () => [
      {
        name: "nome",
        label: "Nome da Loja",
        required: true,
      },
      {
        name: "LUC",
        label: "LUC (Código Único da Loja)",
        required: true,
      },
      {
        name: "localizacao",
        label: "Piso",
      },
      {
        name: "smart",
        label: "Smart",
      },
      {
        name: "idKron",
        label: "ID Kron",
      },
    ],
    []
  );

  // Form fields for equipamentos
  const equipamentoFormFields = useMemo(
    () => [
      {
        name: "nome",
        label: "Nome do Equipamento",
        required: true,
      },
      {
        name: "tipo",
        label: "Tipo de Equipamento",
        type: "select",
        required: true,
        options: [
          { value: "KRON", label: "Kron" },
          { value: "VLC", label: "VLC" }
        ],
      },
      {
        name: "descricao",
        label: "Descrição",
        type: "textarea",
        placeholder: "Descrição detalhada do equipamento (especialmente para VLC)",
      },
      {
        name: "lojaId",
        label: "Loja",
        type: "select",
        required: true,
        options: lojas.map(loja => ({ value: loja.id, label: loja.nome })),
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "OPERACIONAL", label: "Operacional" },
          { value: "MANUTENCAO", label: "Manutenção" },
          { value: "DESATIVADO", label: "Desativado" },
          { value: "DEFEITO", label: "Defeito" },
          { value: "DESCONHECIDO", label: "Desconhecido" }
        ],
      },
    ],
    [lojas]
  );

  // Form fields for atuadores
  const atuadorFormFields = useMemo(
    () => [
      {
        name: "nome",
        label: "Nome do Atuador",
        required: true,
      },
      {
        name: "tipo",
        label: "Tipo",
        required: true,
      },
      {
        name: "lojaId",
        label: "Loja",
        type: "select",
        required: true,
        options: lojas.map(loja => ({ value: loja.id, label: loja.nome })),
      },
      {
        name: "existe",
        label: "Possui Atuador?",
        type: "checkbox",
      },
      {
        name: "estado",
        label: "Status de Funcionamento",
        type: "select",
        options: Object.values(AtuadorStatus).map(status => ({
          value: status,
          label: status.charAt(0) + status.slice(1).toLowerCase()
        })),
      },
      {
        name: "motivoNaoExiste",
        label: "Motivo de não existir",
        type: "textarea",
      },
    ],
    [lojas]
  );

  // Form fields for sensores
  const sensorFormFields = useMemo(
    () => [
      {
        name: "nome",
        label: "Nome do Sensor",
        required: true,
      },
      {
        name: "tipo",
        label: "Tipo de Sensor",
        type: "select",
        required: true,
        options: [
          { value: "AMBIENTE", label: "Ambiente" },
          { value: "INSUFRAMENTO", label: "Insuframento" },
          { value: "MOVIMENTO", label: "Movimento" },
          { value: "BOTAO_PANICO", label: "Botão de Pânico" }
        ],
      },
      {
        name: "lojaId",
        label: "Loja",
        type: "select",
        required: true,
        options: lojas.map(loja => ({ value: loja.id, label: loja.nome })),
      },
      {
        name: "existe",
        label: "Possui Sensor?",
        type: "checkbox",
      },
      {
        name: "estado",
        label: "Status de Funcionamento",
        type: "select",
        options: Object.values(SensorStatus).map(status => ({
          value: status,
          label: status.charAt(0) + status.slice(1).toLowerCase()
        })),
      },
      {
        name: "ultimaAtivacao",
        label: "Última Ativação",
        type: "text",
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "motivoNaoExiste",
        label: "Motivo de não existir",
        type: "textarea",
      },
    ],
    [lojas]
  );

  // Add this near the top of the component with other state declarations
  const [lojaImages, setLojaImages] = useState<Record<string, string>>({});

  // Add this useEffect to fetch images when lojas data changes
  useEffect(() => {
    if (lojas && lojas.length > 0) {
      // Fetch actual image paths from the server
      const fetchImages = async () => {
        try {
          const response = await fetch('/api/lojas/get-images');
          if (response.ok) {
            const data = await response.json();
            setLojaImages(data.images);
          }
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };

      fetchImages();
    }
  }, [lojas]);

  // Function to fetch related entities for a loja
  const fetchRelatedEntities = useCallback(async (lojaId: string) => {
    setLoadingRelatedEntities(true);
    try {
      // Fetch equipamentos for this loja
      const equipamentosResponse = await fetch(`/api/lojasApi/equipamentos-loja?lojaId=${encodeURIComponent(lojaId)}`);
      if (equipamentosResponse.ok) {
        const equipamentosData = await equipamentosResponse.json();
        setLojaEquipamentos(equipamentosData.equipamentos || []);
      } else {
        console.error("Failed to fetch equipamentos:", equipamentosResponse.status, equipamentosResponse.statusText);
        toast.error("Erro ao carregar equipamentos da loja");
      }

      // Fetch atuadores for this loja
      const atuadoresResponse = await fetch(`/api/lojasApi/atuadores-loja?lojaId=${encodeURIComponent(lojaId)}`);
      if (atuadoresResponse.ok) {
        const atuadoresData = await atuadoresResponse.json();
        setLojaAtuadores(atuadoresData.atuadores || []);
      } else {
        console.error("Failed to fetch atuadores:", atuadoresResponse.status, atuadoresResponse.statusText);
        toast.error("Erro ao carregar atuadores da loja");
      }

      // Fetch sensores for this loja
      const sensoresResponse = await fetch(`/api/lojasApi/sensores-loja?lojaId=${encodeURIComponent(lojaId)}`);
      if (sensoresResponse.ok) {
        const sensoresData = await sensoresResponse.json();
        setLojaSensores(sensoresData.sensores || []);
      } else {
        console.error("Failed to fetch sensores:", sensoresResponse.status, sensoresResponse.statusText);
        toast.error("Erro ao carregar sensores da loja");
      }
    } catch (error) {
      console.error("Error fetching related entities:", error);
      toast.error("Erro ao carregar equipamentos, atuadores e sensores da loja");
    } finally {
      setLoadingRelatedEntities(false);
    }
  }, []);

  // Event handlers
  const handleNewLoja = useCallback(() => {
    setEntityType("loja");
    setEditData(null);
    resetLojaForm();
    openModal();
  }, [resetLojaForm, openModal, setEditData]);

  const handleEditLoja = useCallback(
    (loja: Loja) => {
      setEntityType("loja");
      setEditData(loja);
      // Fetch related entities for this loja
      if (loja.id) {
        fetchRelatedEntities(loja.id).catch((error) => {
          console.error("Error in fetchRelatedEntities:", error);
          // Don't let this error break the UI, just show a warning
          toast.warn("Não foi possível carregar todos os dados relacionados da loja");
        });
      }
      openModal();
    },
    [openModal, setEditData, fetchRelatedEntities]
  );

  const handleDeleteLoja = useCallback(
    (loja: Loja) => {
      setLojaToDelete(loja);
      openConfirmModal();
    },
    [openConfirmModal]
  );

  const handleViewDetails = useCallback(
    (loja: Loja) => {
      router.push(`/pages/lojas/detalhes?id=${loja.id}`);
    },
    [router]
  );

  // Handlers for equipamentos
  const handleNewEquipamento = useCallback(() => {
    setEntityType("equipamento");
    setEditEquipamento(null);
    resetEquipamentoForm();
    openModal();
  }, [resetEquipamentoForm, openModal, setEditEquipamento]);

  const handleEditEquipamento = useCallback(
    (equipamento: EquipamentoLoja) => {
      setEntityType("equipamento");
      setEditEquipamento(equipamento);
      openModal();
    },
    [openModal, setEditEquipamento]
  );

  // Handlers for atuadores
  const handleNewAtuador = useCallback(() => {
    setEntityType("atuador");
    setEditAtuador(null);
    resetAtuadorForm();
    openModal();
  }, [resetAtuadorForm, openModal, setEditAtuador]);

  const handleEditAtuador = useCallback(
    (atuador: AtuadorLoja) => {
      setEntityType("atuador");
      setEditAtuador(atuador);
      openModal();
    },
    [openModal, setEditAtuador]
  );

  // Handlers for sensores
  const handleNewSensor = useCallback(() => {
    setEntityType("sensor");
    setEditSensor(null);
    resetSensorForm();
    openModal();
  }, [resetSensorForm, openModal, setEditSensor]);

  const handleEditSensor = useCallback(
    (sensor: SensorLoja) => {
      setEntityType("sensor");
      setEditSensor(sensor);
      openModal();
    },
    [openModal, setEditSensor]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setLojaToDelete(null);
    closeConfirmModal();
  }, [closeConfirmModal]);

  const confirmDelete = useCallback(async () => {
    if (!lojaToDelete) return;
    await deleteItem(lojaToDelete);
    handleCloseConfirmModal();
  }, [lojaToDelete, deleteItem, handleCloseConfirmModal]);

  // Form handlers
  const fecharModal = useCallback(() => {
    setEditData(null);
    setEditEquipamento(null);
    setEditAtuador(null);
    setEditSensor(null);
    resetLojaForm();
    resetEquipamentoForm();
    resetAtuadorForm();
    resetSensorForm();
    closeModal();
  }, [resetLojaForm, resetEquipamentoForm, resetAtuadorForm, resetSensorForm, closeModal, setEditData, setEditEquipamento, setEditAtuador, setEditSensor]);

  // Function to create related entities after loja is created
  const createRelatedEntities = useCallback(async (lojaId: string) => {
    console.log('Creating related entities for lojaId:', lojaId);
    console.log('New equipamentos:', newLojaEquipamentos);
    console.log('New atuadores:', newLojaAtuadores);
    console.log('New sensores:', newLojaSensores);

    try {
      // Create equipamentos
      for (const equipamento of newLojaEquipamentos) {
        if (equipamento.nome) {
          console.log('Creating equipamento:', equipamento);
          const response = await fetch('/api/lojasApi/equipamentos-loja', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nome: equipamento.nome,
              descricao: equipamento.descricao,
              status: equipamento.status,
              lojaId: lojaId,
            }),
          });

          console.log('Equipamento creation response:', response.status, response.statusText);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error creating equipamento:', errorData);
            toast.error(`Erro ao criar equipamento: ${errorData.message || 'Erro desconhecido'}`);
          } else {
            const result = await response.json();
            console.log('Equipamento created successfully:', result);
          }
        }
      }

      // Create atuadores
      for (const atuador of newLojaAtuadores) {
        if (atuador.nome && atuador.tipo) {
          console.log('Creating atuador:', atuador);
          const response = await fetch('/api/lojasApi/atuadores-loja', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nome: atuador.nome,
              tipo: atuador.tipo,
              estado: atuador.estado,
              existe: atuador.existe,
              motivoNaoExiste: atuador.motivoNaoExiste,
              lojaId: lojaId,
            }),
          });

          console.log('Atuador creation response:', response.status, response.statusText);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error creating atuador:', errorData);
            toast.error(`Erro ao criar atuador: ${errorData.message || 'Erro desconhecido'}`);
          } else {
            const result = await response.json();
            console.log('Atuador created successfully:', result);
          }
        }
      }

      // Create sensores
      for (const sensor of newLojaSensores) {
        if (sensor.nome && sensor.tipo) {
          console.log('Creating sensor:', sensor);
          const response = await fetch('/api/lojasApi/sensores-loja', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nome: sensor.nome,
              tipo: sensor.tipo,
              estado: sensor.estado,
              ultimaAtivacao: sensor.ultimaAtivacao,
              existe: sensor.existe,
              motivoNaoExiste: sensor.motivoNaoExiste,
              lojaId: lojaId,
            }),
          });

          console.log('Sensor creation response:', response.status, response.statusText);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error creating sensor:', errorData);
            toast.error(`Erro ao criar sensor: ${errorData.message || 'Erro desconhecido'}`);
          } else {
            const result = await response.json();
            console.log('Sensor created successfully:', result);
          }
        }
      }

      console.log('Finished creating related entities, refreshing data');
      // Refresh the data after creating related entities
      await stableRefetch();
    } catch (error) {
      console.error('Error creating related entities:', error);
      toast.error('Erro ao criar equipamentos, atuadores ou sensores');
    }
  }, [newLojaEquipamentos, newLojaAtuadores, newLojaSensores, stableRefetch]);

  // Function to compress image before upload
  const compressImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.src = imageData;
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions (max 1920px width)
        const maxWidth = 1920;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw image on canvas
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to base64 with compression (0.8 quality)
        const compressedData = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedData);
      };
      img.onerror = () => {
        // If there's an error, return original data
        resolve(imageData);
      };
    });
  };

  // Function to handle image capture for a loja
  const handleImageCapture = useCallback(async (lojaId: string, imageData: string) => {
    try {
      // Compress the image before uploading
      const compressedImageData = await compressImage(imageData);

      const response = await fetch('/api/lojas/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lojaId,
          imageData: compressedImageData, // compressed base64 encoded image
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      toast.success("Imagem salva com sucesso!");

      // Update the image map immediately with the new image URL
      setLojaImages(prev => ({
        ...prev,
        [lojaId]: result.imageUrl
      }));

      // Show a temporary preview of the captured image
      toast.info(`Imagem capturada para a loja ${lojaId}`, {
        autoClose: 3000,
        position: "top-right"
      });

      // Add a small delay to ensure the file system has time to register the new file
      // before refetching the images
      setTimeout(async () => {
        // Refresh the data to show the new image
        await stableRefetch();
        // After refetch, make sure the image is still shown by updating the image map
        // with the newly fetched data
        try {
          const response = await fetch('/api/lojas/get-images');
          if (response.ok) {
            const data = await response.json();
            console.log('Re-fetching image map after refetch:', data.images);
            setLojaImages(data.images);
          }
        } catch (error) {
          console.error('Error re-fetching images after refetch:', error);
        }
      }, 500);
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      toast.error((error as Error).message || "Erro ao salvar a imagem");
      throw error; // Re-throw to be caught by the CardView component
    }
  }, [stableRefetch]);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, entityType:', entityType);

    switch (entityType) {
      case "loja":
        console.log('Processing loja form');
        // Ensure LUC is uppercase before submitting
        const processedLojaData = {
          ...lojaFormValues,
          LUC: lojaFormValues.LUC?.toUpperCase(),
        };
        const isLojaEdit = Boolean(editData);
        console.log('Is edit:', isLojaEdit, 'Edit data:', editData);

        // Save the loja first
        console.log('Saving loja data:', processedLojaData);
        const result = await saveItem(processedLojaData, isLojaEdit);
        console.log('Loja save result:', result);

        // If creating a new loja and there are related entities to create
        if (!isLojaEdit && result && 'id' in result) {
          const lojaId = result.id;
          console.log('Creating related entities for new loja, lojaId:', lojaId);
          console.log('New equipamentos:', newLojaEquipamentos);
          console.log('New atuadores:', newLojaAtuadores);
          console.log('New sensores:', newLojaSensores);

          if (newLojaEquipamentos.length > 0 || newLojaAtuadores.length > 0 || newLojaSensores.length > 0) {
            await createRelatedEntities(lojaId as string);
            // Reset related entities state after creation
            setNewLojaEquipamentos([]);
            setNewLojaAtuadores([]);
            setNewLojaSensores([]);
          }
        }

        // If editing a loja and there are related entities that were updated
        if (isLojaEdit && result && 'id' in result) {
          console.log('Updating related entities for existing loja');
          // Update each related entity that was modified
          for (const equipamento of lojaEquipamentos) {
            if (equipamento.id) {
              // Check if the equipamento has been modified
              const originalEquipamento = equipamentos.find(e => e.id === equipamento.id);
              if (originalEquipamento && JSON.stringify(originalEquipamento) !== JSON.stringify(equipamento)) {
                await saveEquipamento(equipamento, true);
              }
            }
          }

          for (const atuador of lojaAtuadores) {
            if (atuador.id) {
              // Check if the atuador has been modified
              const originalAtuador = atuadores.find(a => a.id === atuador.id);
              if (originalAtuador && JSON.stringify(originalAtuador) !== JSON.stringify(atuador)) {
                await saveAtuador(atuador, true);
              }
            }
          }

          for (const sensor of lojaSensores) {
            if (sensor.id) {
              // Check if the sensor has been modified
              const originalSensor = sensores.find(s => s.id === sensor.id);
              if (originalSensor && JSON.stringify(originalSensor) !== JSON.stringify(sensor)) {
                await saveSensor(sensor, true);
              }
            }
          }

          // Create new related entities that were added during editing
          const lojaId = result.id as string;
          if (newLojaEquipamentos.length > 0 || newLojaAtuadores.length > 0 || newLojaSensores.length > 0) {
            console.log('Creating new related entities for existing loja');
            await createRelatedEntities(lojaId);
            // Reset related entities state after creation
            setNewLojaEquipamentos([]);
            setNewLojaAtuadores([]);
            setNewLojaSensores([]);
          }

          // Refresh the data after updating related entities
          await stableRefetch();
        }
        break;

      case "equipamento":
        console.log('Processing equipamento form');
        const isEquipamentoEdit = Boolean(editEquipamento);
        await saveEquipamento(equipamentoFormValues, isEquipamentoEdit);
        break;

      case "atuador":
        console.log('Processing atuador form');
        const isAtuadorEdit = Boolean(editAtuador);
        await saveAtuador(atuadorFormValues, isAtuadorEdit);
        break;

      case "sensor":
        console.log('Processing sensor form');
        const isSensorEdit = Boolean(editSensor);
        await saveSensor(sensorFormValues, isSensorEdit);
        break;
    }

    fecharModal();
  }, [entityType, editData, editEquipamento, editAtuador, editSensor,
    lojaFormValues, equipamentoFormValues, atuadorFormValues, sensorFormValues,
    newLojaEquipamentos, newLojaAtuadores, newLojaSensores,
    lojaEquipamentos, lojaAtuadores, lojaSensores,
    saveItem, saveEquipamento, saveAtuador, saveSensor,
    createRelatedEntities, stableRefetch, fecharModal, equipamentos, atuadores, sensores]);

  // Initialize forms when editing - with proper dependency arrays
  useEffect(() => {
    if (editData?.id) {
      setLojaValue("nome", editData.nome);
      setLojaValue("LUC", editData.LUC);
      setLojaValue("localizacao", editData.localizacao || "");
      setLojaValue("smart", editData.smart || "");
      setLojaValue("idKron", editData.idKron || "");
    } else if (editData === null) {
      // Only reset when explicitly null, not undefined
      resetLojaForm();
    }
  }, [editData, editData?.id, setLojaValue, resetLojaForm]);

  useEffect(() => {
    if (editEquipamento?.id) {
      setEquipamentoValue("nome", editEquipamento.nome);
      setEquipamentoValue("descricao", editEquipamento.descricao || "");
      setEquipamentoValue("status", editEquipamento.status || "DESCONHECIDO");
      setEquipamentoValue("lojaId", editEquipamento.lojaId || "");
    } else if (editEquipamento === null) {
      // Only reset when explicitly null, not undefined
      resetEquipamentoForm();
    }
  }, [editEquipamento, editEquipamento?.id, setEquipamentoValue, resetEquipamentoForm]);

  useEffect(() => {
    if (editAtuador?.id) {
      setAtuadorValue("nome", editAtuador.nome);
      setAtuadorValue("tipo", editAtuador.tipo);
      setAtuadorValue("estado", editAtuador.estado || AtuadorStatus.DESCONHECIDO);
      setAtuadorValue("existe", editAtuador.existe !== undefined ? editAtuador.existe : true);
      setAtuadorValue("motivoNaoExiste", editAtuador.motivoNaoExiste || "");
      setAtuadorValue("lojaId", editAtuador.lojaId || "");
      setAtuadorValue("equipamentoLojaId", editAtuador.equipamentoLojaId || "");
    } else if (editAtuador === null) {
      // Only reset when explicitly null, not undefined
      resetAtuadorForm();
    }
  }, [editAtuador, editAtuador?.id, setAtuadorValue, resetAtuadorForm]);

  useEffect(() => {
    if (editSensor?.id) {
      setSensorValue("nome", editSensor.nome);
      setSensorValue("tipo", editSensor.tipo);
      setSensorValue("estado", editSensor.estado || SensorStatus.DESCONHECIDO);
      setSensorValue("ultimaAtivacao", editSensor.ultimaAtivacao || "");
      setSensorValue("existe", editSensor.existe !== undefined ? editSensor.existe : true);
      setSensorValue("motivoNaoExiste", editSensor.motivoNaoExiste || "");
      setSensorValue("lojaId", editSensor.lojaId || "");
      setSensorValue("equipamentoLojaId", editSensor.equipamentoLojaId || "");
    } else if (editSensor === null) {
      // Only reset when explicitly null, not undefined
      resetSensorForm();
    }
  }, [editSensor, editSensor?.id, setSensorValue, resetSensorForm]);

  // Update images when lojas data changes
  useEffect(() => {
    if (lojas && lojas.length > 0) {
      // Fetch actual image paths from the server
      const fetchImages = async () => {
        try {
          const response = await fetch('/api/lojas/get-images');
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched image map:', data.images);
            setLojaImages(data.images);
          }
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };

      fetchImages();
    }
  }, [lojas]);

  // Debug log to see what lojaImages state is
  useEffect(() => {
    console.log('lojaImages state:', lojaImages);
  }, [lojaImages]);

  if (loading) {
    return <CmsTableSkeleton />;
  }

  return (
    <ComponentErrorBoundary componentName="Lojas">
      <div className="container">
        {/* View Toggle */}
        <ViewToggle />

        <PageHeader
          title="Gerenciamento de Lojas"
          icon="bi-shop"
          onAddNew={activeTab === "lojas" ? handleNewLoja :
            activeTab === "equipamentos" ? handleNewEquipamento :
              activeTab === "atuadores" ? handleNewAtuador :
                handleNewSensor}
          addButtonLabel={`Adicionar ${activeTab === "lojas" ? "Loja" :
            activeTab === "equipamentos" ? "Equipamento" :
              activeTab === "atuadores" ? "Atuador" : "Sensor"}`}
          searchValue={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Pesquisar por nome, LUC, localização ou loja..."
          itemCount={activeTab === "lojas" ? filteredLojas.length :
            activeTab === "equipamentos" ? filteredEquipamentos.length :
              activeTab === "atuadores" ? filteredAtuadores.length : filteredSensores.length}
        >
          <LojaNavigationSubmenuProps isCollapsed={false} />
          <ToastContainer position="top-right" autoClose={2000} />
        </PageHeader>

        {/* Tabs for different data types */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "lojas" ? "active" : ""}`}
              onClick={() => setActiveTab("lojas")}
            >
              Lojas
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "equipamentos" ? "active" : ""}`}
              onClick={() => setActiveTab("equipamentos")}
            >
              Equipamentos ({equipamentos.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "atuadores" ? "active" : ""}`}
              onClick={() => setActiveTab("atuadores")}
            >
              Atuadores ({atuadores.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "sensores" ? "active" : ""}`}
              onClick={() => setActiveTab("sensores")}
            >
              Sensores ({sensores.length})
            </button>
          </li>
        </ul>

        {/* Display data based on active tab */}
        {activeTab === "lojas" && (
          <>
            <CardView
              data={filteredLojas}
              error={error}
              emptyMessage="Nenhuma loja encontrada com os filtros aplicados. Adicione uma nova ou ajuste os filtros!"
              onEdit={handleEditLoja}
              onDelete={handleDeleteLoja}
              onViewDetails={handleViewDetails}
              onImageCapture={handleImageCapture}
              title="Lojas"
              imageMap={lojaImages}
            />
          </>
        )}

        {activeTab === "equipamentos" && (
          <DataTable
            data={filteredEquipamentos}
            columns={equipamentosColumns}
            error={error}
            emptyMessage="Nenhum equipamento encontrado com os filtros aplicados."
            onEdit={handleEditEquipamento}
            title="Equipamentos"
          />
        )}

        {activeTab === "atuadores" && (
          <DataTable
            data={filteredAtuadores}
            columns={atuadoresColumns}
            error={error}
            emptyMessage="Nenhum atuador encontrado com os filtros aplicados."
            onEdit={handleEditAtuador}
            title="Atuadores"
          />
        )}

        {activeTab === "sensores" && (
          <DataTable
            data={filteredSensores}
            columns={sensoresColumns}
            error={error}
            emptyMessage="Nenhum sensor encontrado com os filtros aplicados."
            onEdit={handleEditSensor}
            title="Sensores"
          />
        )}

        <FormModal
          show={showModal}
          onHide={fecharModal}
          title={editData || editEquipamento || editAtuador || editSensor ?
            `Editar ${entityType === "loja" ? "Loja" : entityType === "equipamento" ? "Equipamento" : entityType === "atuador" ? "Atuador" : "Sensor"}` :
            `Nova ${entityType === "loja" ? "Loja" : entityType === "equipamento" ? "Equipamento" : entityType === "atuador" ? "Atuador" : "Sensor"}`}
          isEdit={Boolean(editData || editEquipamento || editAtuador || editSensor)}
          onSubmit={onSubmit}
          loading={operationLoading || equipamentoOperationLoading || atuadorOperationLoading || sensorOperationLoading}
          fields={entityType === "loja" ? formFields :
            entityType === "equipamento" ? equipamentoFormFields :
              entityType === "atuador" ? atuadorFormFields : sensorFormFields}
          values={{
            ...(entityType === "loja" ? lojaFormValues :
              entityType === "equipamento" ? equipamentoFormValues :
                entityType === "atuador" ? atuadorFormValues : sensorFormValues)
          } as Record<string, unknown>}
          errors={entityType === "loja" ? lojaFormErrors :
            entityType === "equipamento" ? equipamentoFormErrors :
              entityType === "atuador" ? atuadorFormErrors : sensorFormErrors}
          onChange={(field, value) => {
            if (entityType === "loja") {
              // Automatically convert LUC to uppercase
              if (field === "LUC") {
                setLojaValue(field as keyof LojaFormData, (value as string).toUpperCase());
              } else {
                setLojaValue(field as keyof LojaFormData, value);
              }
            } else if (entityType === "equipamento") {
              setEquipamentoValue(field as keyof EquipamentoFormData, value);
            } else if (entityType === "atuador") {
              setAtuadorValue(field as keyof AtuadorFormData, value);
            } else if (entityType === "sensor") {
              setSensorValue(field as keyof SensorFormData, value);
            }
          }}
        >
          {entityType === "loja" && editData && (
            <div className="mt-3">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={openRelatedEntitiesModal}
                disabled={loadingRelatedEntities}
              >
                <i className="bi bi-tools me-1"></i>
                Gerenciar Equipamentos, Atuadores e Sensores
              </Button>
            </div>
          )}
        </FormModal>

        <ConfirmDeleteModal
          show={showConfirmModal}
          onHide={handleCloseConfirmModal}
          onConfirm={confirmDelete}
          loading={operationLoading}
          itemName="a loja"
          itemIdentifier={
            lojaToDelete
              ? `${lojaToDelete.nome} (LUC: ${lojaToDelete.LUC})`
              : ""
          }
          warningMessage="ATENÇÃO: Esta ação irá remover permanentemente a loja e TODOS os equipamentos, atuadores e sensores associados. Esta ação é irreversível."
          confirmLabel="Excluir Loja e Todos os Itens"
        />

        <RelatedEntitiesModal
          show={showRelatedEntitiesModal}
          onHide={closeRelatedEntitiesModal}
          lojaNome={editData?.nome || ""}
          equipamentos={lojaEquipamentos}
          atuadores={lojaAtuadores}
          sensores={lojaSensores}
          loading={loadingRelatedEntities}
          onAddEquipamento={handleNewEquipamento}
          onEditEquipamento={handleEditEquipamento}
          onDeleteEquipamento={deleteEquipamento}
          onAddAtuador={handleNewAtuador}
          onEditAtuador={handleEditAtuador}
          onDeleteAtuador={deleteAtuador}
          onAddSensor={handleNewSensor}
          onEditSensor={handleEditSensor}
          onDeleteSensor={deleteSensor}
        />
      </div>
    </ComponentErrorBoundary>
  );
}