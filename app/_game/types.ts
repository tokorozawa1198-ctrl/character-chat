export type Role = "user" | "assistant";
export type ViewMode = "chat" | "visual" | "action";

export type Message = {
  role: Role;
  content: string;
  avatar?: string;
  generatedImage?: string;
  time?: string;
};

export type DatingEventChoice = {
  label: string;
  text: string;
  affinity: number;
  nextEvent?: string | null;
};

export type DatingEvent = {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  image: string;
  minAffinity?: number;
  choices: DatingEventChoice[];
};

export type SeenEventRecord = {
  id: string;
  title: string;
  seenAt: string;
};

export type ActionItem = {
  label: string;
  emoji: string;
  text: string;
  affinity: number;
  eventId?: string;
  image?: string;
};

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
