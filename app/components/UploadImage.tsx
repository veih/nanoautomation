// /* eslint-disable @next/next/no-img-element */
// "use client";

// import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from "react";

// // Imagem de espaço reservado para demonstração
// const DefaultUploadImage =
//   "https://placehold.co/115x100/A0A0A0/FFFFFF?text=Placeholder";

// export default function UploadImage() {
//   // Estado para verificar se um ficheiro está a ser arrastado sobre a área
//   const [isDragging, setIsDragging] = useState(false);
//   // Estado para armazenar o URL da imagem carregada para pré-visualização
//   const [uploadedImage, setUploadedImage] = useState<string | null>(null);
//   // Estado para armazenar o ficheiro real antes de ser enviado
//   const [fileToUpload, setFileToUpload] = useState<File | null>(null);
//   // Estado para o ID da corretiva
//   const [corretivaId, setCorretivaId] = useState("");
//   // Estado para feedback de mensagem ao usuário
//   const [message, setMessage] = useState<string | null>(null);
//   // Estado para controlar o estado de carregamento
//   const [isLoading, setIsLoading] = useState(false);

//   // Referência ao elemento de input do ficheiro para ativar um clique de forma programática
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Uma função auxiliar para validar se o tipo de ficheiro é uma imagem
//   function validateImage(file: File): boolean {
//     if (file.type.startsWith("image/")) {
//       return true;
//     }
//     setMessage("Por favor, selecione um ficheiro de imagem válido.");
//     return false;
//   }

//   // Uma função auxiliar para processar um ficheiro e definir o estado da imagem carregada
//   function handleFile(file: File) {
//     if (file && validateImage(file)) {
//       const imageUrl = URL.createObjectURL(file);
//       setUploadedImage(imageUrl);
//       setFileToUpload(file);
//       setMessage(null);
//     }
//   }

//   // Manipulador para arrastar um ficheiro sobre a área de carregamento
//   function handleDragOver(e: DragEvent<HTMLDivElement>) {
//     e.preventDefault();
//     setIsDragging(true);
//   }

//   // Manipulador para quando um ficheiro sai da área de carregamento
//   function handleDragLeave(e: DragEvent<HTMLDivElement>) {
//     e.preventDefault();
//     setIsDragging(false);
//   }

//   // Manipulador para soltar um ficheiro na área de carregamento
//   function handleDrop(e: DragEvent<HTMLDivElement>) {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     if (file) {
//       handleFile(file);
//     }
//   }

//   // Manipulador para quando um ficheiro é selecionado usando o input de ficheiro
//   function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (file) {
//       handleFile(file);
//     }
//   }

//   // Manipulador para quando o botão "Escolher um ficheiro" é clicado
//   const handleButtonClick = () => {
//     fileInputRef.current?.click();
//   };

//   // Manipulador para o envio do formulário
//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!fileToUpload || !corretivaId) {
//       setMessage("Por favor, selecione um arquivo e insira o ID da corretiva.");
//       return;
//     }

//     setIsLoading(true);
//     setMessage(null);

//     const formData = new FormData();
//     formData.append("file", fileToUpload);
//     formData.append("corretivaId", corretivaId);

//     try {
//       const response = await fetch("/api/upload-foto", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setMessage(result.message);
//         // Limpa o estado após o envio
//         setUploadedImage(null);
//         setFileToUpload(null);
//         setCorretivaId("");
//       } else {
//         setMessage(`Erro: ${result.error}`);
//       }
//     } catch (error) {
//       console.error("Erro de conexão:", error);
//       setMessage("Erro ao conectar com o servidor.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//       <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-2xl">
//         <h1 className="text-2xl font-semibold text-gray-700">
//           Carregue a sua imagem
//         </h1>
//         <p className="text-sm font-light text-gray-500">
//           O ficheiro deve ser Jpeg, Png, Gif, etc.
//         </p>

//         <form
//           onSubmit={handleSubmit}
//           className="flex w-full flex-col items-center gap-6"
//         >
//           {/* Área para arrastar e soltar */}
//           <div
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             className={`w-full rounded-2xl border-2 border-dashed p-10 transition-colors duration-200 ease-in-out ${
//               isDragging
//                 ? "border-blue-500 bg-blue-50"
//                 : "border-gray-300 bg-gray-50"
//             } flex flex-col items-center justify-center gap-6`}
//           >
//             {uploadedImage ? (
//               <div className="relative h-48 w-full overflow-hidden rounded-xl">
//                 <img
//                   src={uploadedImage}
//                   alt="Pré-visualização da imagem carregada"
//                   className="h-full w-full object-contain rounded-xl"
//                 />
//               </div>
//             ) : (
//               <>
//                 <img
//                   src={DefaultUploadImage}
//                   alt="Imagem de carregamento padrão"
//                   width={115}
//                   height={100}
//                 />
//                 <p className="text-center text-sm font-medium text-gray-400">
//                   Arraste e solte a sua imagem aqui
//                 </p>
//               </>
//             )}
//           </div>

//           <p className="text-gray-400">Ou</p>

//           {/* Botão de seleção de ficheiro */}
//           <div className="w-full">
//             <input
//               type="file"
//               className="hidden"
//               id="fileInput"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               accept="image/*"
//               required
//             />
//             <button
//               type="button"
//               onClick={handleButtonClick}
//               className="w-full transform rounded-lg bg-gray-200 px-6 py-3 text-sm font-medium text-gray-800 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
//             >
//               Escolha um ficheiro
//             </button>
//           </div>

//           {/* Campo de ID da Corretiva */}
//           <div className="w-full">
//             <label
//               htmlFor="corretivaId"
//               className="mb-2 block text-sm font-medium text-gray-700"
//             >
//               ID da Corretiva
//             </label>
//             <input
//               type="text"
//               id="corretivaId"
//               value={corretivaId}
//               onChange={(e) => setCorretivaId(e.target.value)}
//               placeholder="Ex: c123-abc-456"
//               className="w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
//               required
//             />
//           </div>

//           {/* Botão de Envio */}
//           <button
//             type="submit"
//             className={`w-full transform rounded-lg bg-blue-500 px-6 py-3 text-lg font-medium text-white shadow-md transition-all duration-200 ease-in-out hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${
//               isLoading ? "cursor-not-allowed opacity-50" : ""
//             }`}
//             disabled={isLoading}
//           >
//             {isLoading ? "A carregar..." : "Salvar no Banco de Dados"}
//           </button>
//         </form>

//         {/* Mensagens de feedback */}
//         {message && (
//           <div
//             className={`mt-4 w-full rounded-md p-3 text-center ${
//               message.includes("Erro")
//                 ? "bg-red-100 text-red-700"
//                 : "bg-green-100 text-green-700"
//             }`}
//           >
//             {message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
