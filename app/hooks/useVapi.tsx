import { useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";

interface VapiConfig {
  publicKey: string;
  assistantId: string;
  baseUrl?: string;
}

interface VapiState {
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;
}

type VapiAssistantOverrides = Record<string, unknown>;

export const useVapi = (config: VapiConfig) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [state, setState] = useState<VapiState>({
    isSessionActive: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const vapiInstance = new Vapi(config.publicKey, config.baseUrl);
    setVapi(vapiInstance);

    const handleCallStart = () => {
      console.log("✅ Vapi call started successfully");
      setState((prev) => ({
        ...prev,
        isSessionActive: true,
        isLoading: false,
      }));
    };

    const handleCallEnd = () => {
      console.log("📞 Vapi call ended");
      setState((prev) => ({
        ...prev,
        isSessionActive: false,
        isLoading: false,
      }));
    };

    const handleError = (error: Error) => {
      console.error("❌ Vapi error:", error);
      setState((prev) => ({ ...prev, error: error.message, isLoading: false }));
    };

    const handleSpeechStart = () => {
      console.log("🗣️ Speech started");
    };

    const handleSpeechEnd = () => {
      console.log("🔇 Speech ended");
    };

    const handleMessage = (message: unknown) => {
      console.log("📨 Vapi message:", message);
    };

    vapiInstance.on("call-start", handleCallStart);
    vapiInstance.on("call-end", handleCallEnd);
    vapiInstance.on("error", handleError);
    vapiInstance.on("speech-start", handleSpeechStart);
    vapiInstance.on("speech-end", handleSpeechEnd);
    vapiInstance.on("message", handleMessage);

    return () => {
      vapiInstance.off("call-start", handleCallStart);
      vapiInstance.off("call-end", handleCallEnd);
      vapiInstance.off("error", handleError);
      vapiInstance.off("speech-start", handleSpeechStart);
      vapiInstance.off("speech-end", handleSpeechEnd);
      vapiInstance.off("message", handleMessage);
    };
  }, [config.publicKey, config.baseUrl]);

  const startCall = useCallback(
    async (overrides?: VapiAssistantOverrides) => {
      if (!vapi) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log(
          "🚀 Initiating Vapi call with assistant:",
          config.assistantId
        );
        console.log("📋 Overrides:", overrides);
        await vapi.start(config.assistantId, {
          ...overrides,
          maxDurationSeconds: 300,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("💥 Failed to start call:", errorMessage);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [vapi, config.assistantId]
  );

  const endCall = useCallback(() => {
    if (!vapi) return;
    vapi.stop();
  }, [vapi]);

  return {
    startCall,
    endCall,
    ...state,
  };
};
