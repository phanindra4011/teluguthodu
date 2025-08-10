"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CornerDownLeft, Mic, Search, BotIcon, Book, Image as ImageIcon, MessageCircle, ArrowUp, History, PlusCircle, Trash2, Languages, Upload } from "lucide-react";
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
import { Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarFooter } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mascot, type MascotMood } from "@/components/chat/mascot";
import React from "react";
import { Slot } from "@radix-ui/react-slot";

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
  const [activeTab, setActiveTab] = useState("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Telugu');
  const [mascotMood, setMascotMood] = useState<MascotMood>('neutral');

  const { toast } = useToast();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedInput = useDebounce(input, 300);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory) as ChatSession[];
      setChatHistory(parsedHistory);
      if (parsedHistory.length > 0) {
        setCurrentChatId(parsedHistory[0].id);
      }
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
    setMascotMood('neutral');
  }

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(chatHistory.length > 1 ? chatHistory[1].id : null);
    }
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
      })
    );
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!currentChatId) {
        createNewChat();
    }
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    updateMessages((prev) => [...prev, userMessage, { id: 'loading', role: 'loading' }]);
    setInput("");
    setSuggestions([]);
    setIsLoading(true);
    setMascotMood('neutral');

    try {
      const aiResponse = await getAiResponse(input, grade, activeTab, {sourceLang, targetLang});
      
      const newAiMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "ai",
        content: aiResponse.responseText,
        imageUrl: aiResponse.imageUrl,
        emotion: aiResponse.emotion,
      };

      if (aiResponse.emotion) {
        const emotion = aiResponse.emotion.toLowerCase();
        if (emotion.includes('confus') || emotion.includes('frustrat')) {
          setMascotMood('encouraging');
        } else if (emotion.includes('curious') || emotion.includes('happy') || emotion.includes('excit')) {
          setMascotMood('happy');
        }
      }

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
      setMascotMood('encouraging');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInput(text);
      };
      reader.readAsText(file);
    }
  };

  const getPlaceholderText = () => {
    switch(activeTab) {
      case 'chat': return 'మీ AI స్నేహితుడితో తెలుగులో మాట్లాడండి...';
      case 'ask': return 'తెలుగులో ఒక ప్రశ్న అడగండి...';
      case 'summarize': return 'సంగ్రహించడానికి తెలుగు వచనాన్ని అతికించండి...';
      case 'image': return 'తెలుగులో సృష్టించాల్సిన చిత్రాన్ని వివరించండి...';
      case 'translate': return `${sourceLang} నుండి ${targetLang}కు అనువదించండి...`;
      default: return 'మీ సందేశాన్ని టైప్ చేయండి...';
    }
  }

  return (
    <>
      <Sidebar side="left">
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">చాట్ చరిత్ర</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={createNewChat}>
              <PlusCircle className="h-5 w-5"/>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  className="w-full justify-start"
                  isActive={chat.id === currentChatId}
                  onClick={() => setCurrentChatId(chat.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="truncate">{chat.title}</span>
                </SidebarMenuButton>
                <SidebarMenuAction onClick={() => deleteChat(chat.id)}><Trash2/></SidebarMenuAction>
              </SidebarMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">ఇంకా చాట్ చరిత్ర లేదు.</div>
          )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col h-full bg-muted/30">
        <header className="flex items-center justify-between p-4 border-b bg-background shrink-0">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden"/>
            <Mascot mood={mascotMood} className="h-10 w-10 text-primary" />
            <h1 className="text-xl font-bold font-headline">తెలుగు తోడు</h1>
          </div>
          <div className="flex items-center gap-2">
            <GradeSelector value={grade} onValueChange={setGrade} />
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0">
          <div className="p-4 pb-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="">
              <TabsList className="grid w-full grid-cols-5 bg-muted/60">
                <TabsTrigger value="chat"><MessageCircle className="mr-2 h-4 w-4"/>చాట్</TabsTrigger>
                <TabsTrigger value="ask"><Search className="mr-2 h-4 w-4"/>అడగండి</TabsTrigger>
                <TabsTrigger value="summarize"><Book className="mr-2 h-4 w-4"/>సంగ్రహించండి</TabsTrigger>
                <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4"/>చిత్రం</TabsTrigger>
                <TabsTrigger value="translate"><Languages className="mr-2 h-4 w-4"/>అనువదించండి</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center justify-center gap-4 p-4">
            {activeTab === 'translate' && (
              <>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Telugu">Telugu</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }}>
                    <History className="h-5 w-5" />
                </Button>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Target" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Telugu">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
             {activeTab === 'summarize' && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </>
             )}
          </div>


          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-6 p-4">
              {messages.length === 0 && !currentChatId && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                  <BotIcon className="h-16 w-16 mb-4 text-primary/50" />
                  <h2 className="text-2xl font-semibold text-foreground">స్వాగతం!</h2>
                  <p>కొత్త చాట్‌ను ప్రారంభించండి లేదా మీ చరిత్ర నుండి ఒకదాన్ని ఎంచుకోండి.</p>
                </div>
              )}
               {messages.length === 0 && currentChatId && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                  <BotIcon className="h-16 w-16 mb-4 text-primary/50" />
                  <h2 className="text-2xl font-semibold text-foreground">నేను ఎలా సహాయపడగలను?</h2>
                  <p>ప్రారంభించడానికి పైన ఒక ఫీచర్‌ని ఎంచుకుని, సందేశం పంపండి.</p>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} speak={speak} />
              ))}
            </div>
          </ScrollArea>
        </main>

        <footer className="p-4 pt-2 bg-background border-t space-y-4">
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
              disabled={isLoading || !currentChatId}
            />
            <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
              <Button type="button" size="icon" variant="ghost" className={cn("transition-colors rounded-full", isListening ? "text-destructive bg-destructive/10" : "text-muted-foreground")} onClick={handleVoiceInput} disabled={isLoading || !currentChatId}>
                <Mic className="h-5 w-5" />
                <span className="sr-only">Voice Input</span>
              </Button>
              <Button type="submit" size="icon" className="rounded-full" disabled={isLoading || !input.trim() || !currentChatId}>
                <ArrowUp className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </footer>
      </div>
    </>
  );
}
