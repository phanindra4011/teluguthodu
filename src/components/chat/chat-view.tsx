"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CornerDownLeft, Mic, Search, BotIcon, Book, Image as ImageIcon, MessageCircle, ArrowUp } from "lucide-react";
import { getAiResponse, getAutocompleteSuggestions } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GradeSelector } from "@/components/grade-selector";
import { ChatMessage } from "@/components/chat/chat-message";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export type Message = {
  id: string;
  role: "user" | "ai" | "loading";
  content?: string;
  imageUrl?: string;
  emotion?: string;
};

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [grade, setGrade] = useState("6");
  const [activeTab, setActiveTab] = useState("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const { toast } = useToast();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const fetchAutocomplete = async () => {
      if (debouncedInput.length > 2) {
        const result = await getAutocompleteSuggestions(debouncedInput, parseInt(grade));
        if (result && result.suggestions) {
          setSuggestions(result.suggestions);
        }
      } else {
        setSuggestions([]);
      }
    };
    fetchAutocomplete();
  }, [debouncedInput, grade]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'te-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          variant: 'destructive',
          title: "Voice Error",
          description: "Couldn't recognize speech. Please try again.",
        });
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);
  
  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        toast({
          variant: 'destructive',
          title: "Unsupported Browser",
          description: "Voice input is not supported by your browser.",
        });
      }
    }
  };

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const teluguVoice = voices.find(voice => voice.lang === 'te-IN');
      if (teluguVoice) {
        utterance.voice = teluguVoice;
      }
      utterance.lang = 'te-IN';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
          variant: 'destructive',
          title: "Unsupported Browser",
          description: "Text to speech is not supported by your browser.",
      });
    }
  }, [toast]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage, { id: 'loading', role: 'loading' }]);
    setInput("");
    setSuggestions([]);
    setIsLoading(true);

    try {
      const aiResponse = await getAiResponse(input, grade, activeTab);
      
      const newAiMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "ai",
        content: aiResponse.responseText,
        imageUrl: aiResponse.imageUrl,
        emotion: aiResponse.emotion,
      };

      setMessages((prev) => [...prev.filter(m => m.role !== 'loading'), newAiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: 'destructive',
        title: "AI Error",
        description: errorMessage,
      });
      setMessages((prev) => prev.filter(m => m.role !== 'loading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  const getPlaceholderText = () => {
    switch(activeTab) {
      case 'chat': return 'Talk to your AI friend in Telugu...';
      case 'ask': return 'Ask a question in Telugu...';
      case 'summarize': return 'Paste Telugu text to summarize...';
      case 'image': return 'Describe an image to create in Telugu...';
      default: return 'Type your message...';
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <header className="flex items-center justify-between p-4 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <BotIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-headline">Vidyarthi Mitra</h1>
        </div>
        <div className="flex items-center gap-2">
          <GradeSelector value={grade} onValueChange={setGrade} />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className="grid w-full grid-cols-4 bg-muted/60">
              <TabsTrigger value="chat"><MessageCircle className="mr-2 h-4 w-4"/>Chat</TabsTrigger>
              <TabsTrigger value="ask"><Search className="mr-2 h-4 w-4"/>Ask a Question</TabsTrigger>
              <TabsTrigger value="summarize"><Book className="mr-2 h-4 w-4"/>Summarize</TabsTrigger>
              <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4"/>Create Image</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="space-y-6 p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                <BotIcon className="h-16 w-16 mb-4 text-primary/50" />
                <h2 className="text-2xl font-semibold text-foreground">Welcome!</h2>
                <p>How can I help you learn today?</p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} speak={speak} />
            ))}
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 pt-2 bg-background border-t space-y-4">
        {activeTab === 'chat' && (
          <Alert className="bg-primary/10 border-primary/20 text-primary-foreground/90">
            <BotIcon className="h-4 w-4 text-primary" />
            <AlertTitle className="font-semibold text-primary/90">Friendly Reminder</AlertTitle>
            <AlertDescription className="text-primary/80">
              AI can make mistakes. Please double-check the information.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="relative">
          {suggestions.length > 0 && (
            <div className="absolute bottom-full mb-2 w-full bg-card border rounded-lg shadow-lg p-2 space-y-1 z-10">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left p-2 rounded-md hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholderText()}
            className="pr-24 min-h-[52px] resize-none rounded-full px-6 py-3.5"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            disabled={isLoading}
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
             <Button type="button" size="icon" variant="ghost" className={cn("transition-colors rounded-full", isListening ? "text-destructive bg-destructive/10" : "text-muted-foreground")} onClick={handleVoiceInput} disabled={isLoading}>
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice Input</span>
            </Button>
            <Button type="submit" size="icon" className="rounded-full" disabled={isLoading || !input.trim()}>
              <ArrowUp className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}
