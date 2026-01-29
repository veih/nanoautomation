declare module 'react-speech-recognition' {
    export interface SpeechRecognitionOptions {
        language?: string;
        continuous?: boolean;
        interimResults?: boolean;
    }

    export interface SpeechRecognitionHook {
        transcript: string;
        interimTranscript: string;
        finalTranscript: string;
        listening: boolean;
        resetTranscript: () => void;
        browserSupportsSpeechRecognition: boolean;
        isMicrophoneAvailable: boolean;
    }

    export function useSpeechRecognition(options?: SpeechRecognitionOptions): SpeechRecognitionHook;

    export namespace SpeechRecognition {
        function startListening(options?: SpeechRecognitionOptions): void;
        function stopListening(): void;
        function abortListening(): void;
        function getRecognition(): SpeechRecognition | null;
    }

    const SpeechRecognitionExport: {
        useSpeechRecognition: typeof useSpeechRecognition;
        startListening: typeof SpeechRecognition.startListening;
        stopListening: typeof SpeechRecognition.stopListening;
        abortListening: typeof SpeechRecognition.abortListening;
        getRecognition: typeof SpeechRecognition.getRecognition;
    };

    export default SpeechRecognitionExport;
}