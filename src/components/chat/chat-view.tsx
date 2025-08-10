
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, BotIcon, Book, Image as ImageIcon, MessageCircle, History, Languages, User, Settings, Sun, Moon, Upload } from "lucide-react";
import { getAiResponse, getAutocompleteSuggestions } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat/chat-message";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GradeSelector } from "../grade-selector";

export type Message = {
  id: string;
  role: "user" | "ai" | "loading";
  content?: string;
  imageUrl?: string;
  emotion?: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

export function ChatView() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [input, setInput] = useState("");
  const [grade, setGrade] = useState("6");
  const [activeFeature, setActiveFeature] = useState("summarize");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedInput = useDebounce(input, 300);

  // Fix for hydration error
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);


  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory) as ChatSession[];
      setChatHistory(parsedHistory);
      if (parsedHistory.length > 0) {
        setCurrentChatId(parsedHistory[0].id);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const messages = chatHistory.find(chat => chat.id === currentChatId)?.messages ?? [];

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
    if (activeFeature === 'chat' || activeFeature === 'ask') {
        fetchAutocomplete();
    }
  }, [debouncedInput, grade, activeFeature]);

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
      utterance.lang = 'te-IN';
      const voices = window.speechSynthesis.getVoices();
      const teluguVoice = voices.find(voice => voice.lang === 'te-IN');
      if (teluguVoice) {
        utterance.voice = teluguVoice;
      }
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

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now()
    };
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
  }
  
  const updateMessages = (newMessages: Message[] | ((prevMessages: Message[]) => Message[])) => {
    setChatHistory(prev =>
      prev.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = typeof newMessages === 'function' ? newMessages(chat.messages) : newMessages;
          
          let newTitle = chat.title;
          if (chat.title === 'New Chat' && updatedMessages.length > 0 && updatedMessages[0].role === 'user') {
            newTitle = updatedMessages[0].content?.substring(0, 30) || 'Chat';
          }

          return { ...chat, messages: updatedMessages, title: newTitle };
        }
        return chat;
      }).sort((a,b) => b.createdAt - a.createdAt)
    );
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | { preventDefault: () => void; }, submissionInput?: string) => {
    e.preventDefault();
    const currentInput = submissionInput || input;
    if (!currentInput.trim() || isLoading) return;

    if (!currentChatId) {
        createNewChat();
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: currentInput };
    updateMessages((prev) => [...prev, userMessage, { id: 'loading', role: 'loading' }]);
    setInput("");
    setSuggestions([]);
    setIsLoading(true);

    try {
      const aiResponse = await getAiResponse(currentInput, grade, activeFeature);
      
      const newAiMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "ai",
        content: aiResponse.responseText,
        imageUrl: aiResponse.imageUrl,
        emotion: aiResponse.emotion,
      };

      updateMessages((prev) => [...prev.filter(m => m.role !== 'loading'), newAiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: 'destructive',
        title: "AI Error",
        description: errorMessage,
      });
      updateMessages((prev) => prev.filter(m => m.role !== 'loading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
    handleSubmit({ preventDefault: () => {} }, suggestion);
  };

  const handleFeatureSuggestionClick = (feature: string, prompt: string) => {
    setActiveFeature(feature);
    setInput(prompt);
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    toast({ title: "Uploading and processing file..." });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File processing failed');
      }

      const data = await response.json();
      setInput(data.text);
      toast({ title: "File processed successfully!", description: "The extracted text has been placed in the text area." });

    } catch (error) {
      console.error("File upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during file upload.";
      toast({
        variant: 'destructive',
        title: "File Upload Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'summarize', label: 'Summarize', icon: Book },
    { id: 'image', label: 'Imagine', icon: ImageIcon },
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <nav className="w-64 flex flex-col p-4 bg-card border-r">
        <div className="flex items-center gap-2 mb-8">
            <BotIcon className="w-8 h-8 text-primary"/>
            <h1 className="text-xl font-bold">తెలుగు తోడు</h1>
        </div>
        <div className="flex-1 flex flex-col gap-2">
            {navItems.map(item => (
                <Button 
                    key={item.id}
                    variant={activeFeature === item.id ? 'secondary' : 'ghost'} 
                    className="justify-start gap-3"
                    onClick={() => setActiveFeature(item.id)}
                >
                    <item.icon className="w-5 h-5"/>
                    {item.label}
                </Button>
            ))}
        </div>
        <div className="flex flex-col gap-2">
           <Button variant='ghost' className="justify-start gap-3">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary/20 text-xs">U</AvatarFallback>
              </Avatar>
              Profile
            </Button>
            <div className="flex justify-around">
                <Button variant="ghost" size="icon" onClick={() => {}}><Settings className="w-5 h-5"/></Button>
                {mounted && (
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                    </Button>
                )}
            </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold capitalize">{activeFeature}</h2>
          <div className="flex items-center gap-4">
            {activeFeature === 'summarize' && (
              <>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.pdf,.docx" className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" disabled={isLoading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </>
            )}
            <GradeSelector value={grade} onValueChange={setGrade}/>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0 bg-background">
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-6 p-4 md:p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                    <div className="bg-primary/10 rounded-full p-4 mb-4">
                        <BotIcon className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">నమస్కారం! నేను మీ తెలుగు తోడు</h2>
                    <p className="max-w-md mb-8">మీ చదువులో సహాయం చేసే AI స్నేహితుడిని. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                        <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 text-left" onClick={() => handleFeatureSuggestionClick('ask', 'What is photosynthesis?')}>
                            <div className="flex items-center gap-2">
                                <BotIcon className="w-5 h-5 text-primary"/>
                                <span className="font-semibold">Ask a question</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Get a quick explanation of a concept.</p>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 text-left" onClick={() => handleFeatureSuggestionClick('image', 'A serene village in Telangana')}>
                             <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary"/>
                                <span className="font-semibold">Draw a picture</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Bring your ideas to life with an image.</p>
                        </Button>
                         <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 text-left" onClick={() => handleFeatureSuggestionClick('summarize', 'Please provide the text you want to summarize.')}>
                            <div className="flex items-center gap-2">
                                <Book className="w-5 h-5 text-primary"/>
                                <span className="font-semibold">Summarize</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Summarize a long piece of text.</p>
                        </Button>
                         <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 text-left" onClick={() => handleFeatureSuggestionClick('translate', 'Enter text to translate...')}>
                             <div className="flex items-center gap-2">
                                <Languages className="w-5 h-5 text-primary"/>
                                <span className="font-semibold">Translate</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Translate between Telugu and English.</p>
                        </Button>
                    </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} speak={speak} />
                ))
              )}
            </div>
          </ScrollArea>

          <footer className="p-4 pt-2 bg-background space-y-2">
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
                placeholder="ఏదైనా అడగండి..."
                className="pr-24 min-h-[52px] resize-none rounded-xl border-input bg-card px-4 py-3.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                disabled={isLoading || !currentChatId}
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
                <Button type="button" size="icon" variant="ghost" className={cn("transition-colors rounded-full text-muted-foreground", isListening && "text-destructive")} onClick={handleVoiceInput} disabled={isLoading || !currentChatId}>
                  <Mic className="h-5 w-5" />
                  <span className="sr-only">Voice Input</span>
                </Button>
                <Button type="submit" size="icon" className="rounded-full w-9 h-9 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading || !input.trim() || !currentChatId}>
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
            <p className="text-xs text-center text-muted-foreground">తెలుగు తోడు AI తప్పులు చేయగలదు. దయచేసి సమాచారాన్ని సరిచూసుకోండి.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
