
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, BotIcon, Book, Image as ImageIcon, MessageCircle, History, Languages, User, Settings, Sun, Moon, Upload, Plus } from "lucide-react";
import { Logo } from "@/components/icons";
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
import { Card } from "../ui/card";
import { formatDistanceToNow } from 'date-fns';


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
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [grade, setGrade] = useState("6");
  const [activeFeature, setActiveFeature] = useState("chat");
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



  // Simple storage functions that only handle chat history
  const saveChatHistory = (history: ChatSession[]) => {
    try {
      // Only save completed chats (not the current session)
      const completedChats = history.filter(chat => chat.messages.length > 0);
      const compressed = JSON.stringify(completedChats);
      
      // Check if data is too large and clean up if needed
      if (compressed.length > 4000000) { // 4MB limit
        const reducedHistory = completedChats
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 10); // Keep only 10 most recent
        localStorage.setItem("chatHistory", JSON.stringify(reducedHistory));
        toast({
          title: "Storage Cleaned",
          description: "Old chat history has been cleaned to save space.",
        });
      } else {
        localStorage.setItem("chatHistory", compressed);
      }
      return true;
    } catch (error) {
      console.error('Failed to save chat history:', error);
      // If storage fails, try to clean up and save again
      try {
        const reducedHistory = history
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5); // Keep only 5 most recent
        localStorage.setItem("chatHistory", JSON.stringify(reducedHistory));
        toast({
          title: "Storage Cleaned",
          description: "Storage was full. Old chats have been removed.",
        });
        return true;
      } catch (e) {
        console.error('Failed to save even after cleanup:', e);
        return false;
      }
    }
  };

  const loadChatHistory = (): ChatSession[] => {
    try {
      const saved = localStorage.getItem("chatHistory");
      if (saved) {
        return JSON.parse(saved) as ChatSession[];
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
    return [];
  };

  // Load only chat history on component mount, don't load current session
  useEffect(() => {
    const history = loadChatHistory();
    setChatHistory(history);
    // Always start with a fresh session
        createNewChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save chat history when it changes (but not current session)
  useEffect(() => {
    if (chatHistory.length > 0) {
      saveChatHistory(chatHistory);
    }
  }, [chatHistory]);

  const createNewChat = useCallback(() => {
    const newChatId = Date.now().toString();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now()
    };
    
    setCurrentSession(newChat);
    setCurrentChatId(newChatId);
    return newChatId;
  }, []);

  // Get current messages (from current session, not from history)
  const getCurrentMessages = useCallback(() => {
    return currentSession?.messages || [];
  }, [currentSession]);

  // Add message to current session
  const addMessageToCurrentSession = useCallback((message: Message) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message]
      };
    });
  }, []);

  // Save current session to history when it's complete
  const saveCurrentSessionToHistory = useCallback(() => {
    if (currentSession && currentSession.messages.length > 0) {
      setChatHistory(prev => {
        const updatedHistory = [currentSession, ...prev].sort((a,b) => b.createdAt - a.createdAt);
        return updatedHistory;
      });
    }
  }, [currentSession]);

  const messages = getCurrentMessages();

  // Improved scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior,
        });
      }
    }
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Use a small delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, scrollToBottom]);

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
    // @ts-ignore - vendor-prefixed SpeechRecognition in some browsers
    const AnyWindow: any = window as any;
    if ('SpeechRecognition' in AnyWindow || 'webkitSpeechRecognition' in AnyWindow) {
      const SpeechRecognitionCtor = (AnyWindow as any).SpeechRecognition || (AnyWindow as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionCtor();
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
  
  const updateMessages = (chatId: string, newMessages: Message[] | ((prevMessages: Message[]) => Message[])) => {
    // Update current session if it matches the chatId
    if (currentSession && currentSession.id === chatId) {
      setCurrentSession(prev => {
        if (!prev) return prev;
        const updatedMessages = typeof newMessages === 'function' ? newMessages(prev.messages) : newMessages;
        
        let newTitle = prev.title;
        if ((prev.title === 'New Chat' || !prev.title) && updatedMessages.length > 0 && updatedMessages[0].role === 'user') {
            newTitle = updatedMessages[0].content?.substring(0, 30) || 'Chat';
          }

        return { ...prev, messages: updatedMessages, title: newTitle };
      });
    }
    
    // Upsert into history to avoid losing current session on refresh
    setChatHistory(prev => {
      const existing = prev.find(c => c.id === chatId);
      if (existing) {
        const updatedMessages = typeof newMessages === 'function' ? newMessages(existing.messages) : newMessages;
        let newTitle = existing.title;
        if ((existing.title === 'New Chat' || !existing.title) && updatedMessages.length > 0 && updatedMessages[0].role === 'user') {
          newTitle = updatedMessages[0].content?.substring(0, 30) || 'Chat';
        }
        return prev
          .map(c => (c.id === chatId ? { ...c, messages: updatedMessages, title: newTitle } : c))
          .sort((a,b) => b.createdAt - a.createdAt);
      } else {
        const baseTitle = (typeof newMessages === 'function' ? newMessages([]) : newMessages);
        const titleFromFirst = baseTitle.length > 0 && baseTitle[0].role === 'user' ? (baseTitle[0].content?.substring(0,30) || 'Chat') : 'New Chat';
        const updatedMessages = typeof newMessages === 'function' ? newMessages([]) : newMessages;
        const newEntry: ChatSession = {
          id: chatId,
          title: titleFromFirst,
          messages: updatedMessages,
          createdAt: Date.now(),
        };
        return [newEntry, ...prev].sort((a,b) => b.createdAt - a.createdAt);
      }
    });
  };
  
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | { preventDefault: () => void; },
    submissionInput?: string,
    featureOverride?: string
  ) => {
    e.preventDefault();
    const currentInput = submissionInput || input;
    if (!currentInput.trim() || isLoading) return;

    let chatId = currentChatId;
    let currentMessages = getCurrentMessages();

    if (!chatId || (currentMessages.length > 0 && activeFeature === 'history')) {
        chatId = createNewChat();
    }

    const userMessage: Message = { id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`), role: 'user', content: currentInput };
    const loadingId = `loading-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;
    const loadingMessage: Message = { id: loadingId, role: 'loading' };
    
    updateMessages(chatId, (prev) => [...prev, userMessage, loadingMessage]);

    setInput("");
    setSuggestions([]);
    setIsLoading(true);

    try {
      const aiResponse = await getAiResponse(currentInput, grade, featureOverride ?? activeFeature);
      
      if (aiResponse.error || (!aiResponse.responseText && !aiResponse.imageUrl)) {
        throw new Error(aiResponse.error || "The AI returned an empty response.");
      }

      const newAiMessage: Message = {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
        role: "ai",
        content:
          (featureOverride ?? activeFeature) === 'summarize' && typeof aiResponse.responseText !== 'string'
            ? (aiResponse.summary || aiResponse.responseText || '')
            : aiResponse.responseText,
        imageUrl: aiResponse.imageUrl,
        emotion: aiResponse.emotion,
      };

      updateMessages(chatId, (prev) => [...prev.filter(m => m.id !== loadingId), newAiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: 'destructive',
        title: "AI Error",
        description: errorMessage,
      });
      updateMessages(chatId, (prev) => prev.filter(m => m.id !== loadingId));
    } finally {
      setIsLoading(false);
      saveCurrentSessionToHistory(); // Save session to history after completion
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
    handleSubmit({ preventDefault: () => {} }, suggestion);
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
      // Start a new summarize conversation directly using the extracted text
      setActiveFeature('summarize');
      let chatId = currentChatId;
      const currentMessages = getCurrentMessages();
      if (!chatId || currentMessages.length > 0) {
        chatId = createNewChat();
      }
      const prompt = data.text as string;
      toast({ title: "File processed successfully!", description: "Summarizing the uploaded document..." });
      // Trigger summarization flow via the standard submit path, forcing feature
      await handleSubmit({ preventDefault: () => {} }, prompt, 'summarize');

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

  const welcomeScreens: { [key: string]: { title: string; subtitle: string; prompts: { icon: any; title: string; subtitle: string; action: () => void; }[] } } = {
    chat: {
      title: "నమస్కారం! నేను మీ తెలుగు తోడు",
      subtitle: "మీ చదువులో సహాయం చేసే AI స్నేహితుడిని. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?",
      prompts: [
        { icon: BotIcon, title: "Ask a question", subtitle: "What is photosynthesis?", action: () => handleSuggestionClick("What is photosynthesis?") },
        { icon: ImageIcon, title: "Draw a picture", subtitle: "A serene village in Telangana", action: () => { setActiveFeature("image"); createNewChat(); handleSuggestionClick("A serene village in Telangana"); } },
        { icon: Book, title: "Summarize text", subtitle: "Click to switch to Summarize feature", action: () => { setActiveFeature("summarize"); createNewChat(); } },
        { icon: Languages, title: "Translate something", subtitle: "Translate 'Hello' to Telugu", action: () => { setActiveFeature("translate"); createNewChat(); handleSuggestionClick("Hello"); } },
      ]
    },
    summarize: {
      title: "సారాంశం చేద్దాం",
      subtitle: "సారాంశం చేయడానికి దయచేసి టెక్స్ట్ అందించండి లేదా పత్రాన్ని అప్‌లోడ్ చేయండి.",
      prompts: [
        { icon: Upload, title: "Upload a document", subtitle: ".txt, .pdf, .docx ఫైళ్లను అప్‌లోడ్ చేయండి.", action: () => fileInputRef.current?.click() },
        { icon: Book, title: "Paste text", subtitle: "Paste text directly into the text box below.", action: () => { document.querySelector('textarea')?.focus() } }
      ]
    },
    image: {
      title: "ఒక చిత్రాన్ని ఊహించుకోండి",
      subtitle: "మీరు నన్ను గీయాలనుకుంటున్న చిత్రం గురించి వివరించండి.",
      prompts: [
        { icon: ImageIcon, title: "A farmer in a paddy field", subtitle: "in Telangana", action: () => handleSuggestionClick("A farmer in a paddy field in Telangana") },
        { icon: ImageIcon, title: "Charminar during sunset", subtitle: "A realistic image", action: () => handleSuggestionClick("A realistic image of Charminar during sunset") }
      ]
    },
    translate: {
      title: "అనువాదం చేద్దాం",
      subtitle: "తెలుగు మరియు ఇంగ్లీష్ మధ్య అనువదించడానికి టెక్స్ట్ నమోదు చేయండి.",
      prompts: [
        { icon: Languages, title: "Translate 'Hello'", subtitle: "to Telugu", action: () => handleSuggestionClick("Hello") },
        { icon: Languages, title: "Translate 'ధన్యవాదాలు'", subtitle: "to English", action: () => handleSuggestionClick("ధన్యవాదాలు") }
      ]
    }
  };

  const renderWelcomeScreen = () => {
    if (activeFeature === 'history') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10">
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Chat History</h2>
            {chatHistory.filter(c => c.messages.length > 0).length > 0 ? (
              <div className="space-y-4">
                {chatHistory.filter(c => c.messages.length > 0).map(chat => (
                  <Card 
                    key={chat.id} 
                    className="p-4 text-left hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setActiveFeature('chat');
                    }}
                  >
                    <h3 className="font-semibold text-foreground">{chat.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{chat.messages[chat.messages.length -1]?.content ?? '...'}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No chat history yet. Start a new conversation!</p>
            )}
          </div>
        </div>
      );
    }
    const currentScreen = welcomeScreens[activeFeature];
    if (!currentScreen) return null;

    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
              <BotIcon className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{currentScreen.title}</h2>
          <p className="max-w-md mb-8">{currentScreen.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {currentScreen.prompts.map((prompt, index) => (
                  <Button key={index} variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 text-left" onClick={prompt.action}>
                      <div className="flex items-center gap-2">
                          <prompt.icon className="w-5 h-5 text-primary"/>
                          <span className="font-semibold">{prompt.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{prompt.subtitle}</p>
                  </Button>
              ))}
          </div>
      </div>
    );
  };


  return (
    <div className="flex h-screen bg-background text-foreground">
      <nav className="w-64 flex flex-col p-4 bg-card border-r">
        <div className="flex items-center gap-2 mb-8">
            <BotIcon className="w-8 h-8 text-primary"/>
            <h1 className="text-xl font-bold">తెలుగు తోడు</h1>
        </div>
        <div className="flex-1 flex flex-col gap-2">
            <Button 
                variant={'secondary'} 
                className="justify-start gap-3 mb-4"
                onClick={() => {
                    setActiveFeature('chat');
                    createNewChat();
                }}
            >
                <Plus className="w-5 h-5"/>
                New Chat
            </Button>
            {navItems.map(item => (
                <Button 
                    key={item.id}
                    variant={activeFeature === item.id ? 'secondary' : 'ghost'} 
                    className="justify-start gap-3"
                    onClick={() => {
                        setActiveFeature(item.id);
                        // Create a new chat when category is selected
                        createNewChat();
                    }}
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
                           <Button 
                variant="ghost" 
                className="justify-start gap-3 text-xs"
                onClick={() => {
                  // Simple cleanup - keep only 5 most recent chats
                  const reducedHistory = chatHistory
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 5);
                  setChatHistory(reducedHistory);
                  toast({
                    title: "Storage Cleaned",
                    description: "Old chat history has been cleaned to save space.",
                  });
                }}
                title="Clean up old chat history to save storage space"
              >
                <Settings className="w-4 h-4"/>
                Clean Storage
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
          <div className="flex items-center gap-3">
            <Logo size={24} withText={false} />
            <h2 className="text-lg font-semibold capitalize">{currentSession?.title ?? 'Chat'}</h2>
          </div>
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

        <main className="flex-1 flex flex-col min-h-0 bg-background relative">
          <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
            <div className="space-y-6 p-4 md:p-6">
              {messages.length === 0 ? (
                renderWelcomeScreen()
              ) : (
                messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} speak={speak} />
                ))
              )}
            </div>
          </ScrollArea>
          
          {/* Scroll to bottom button */}
          {messages.length > 2 && (
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-20 right-6 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => scrollToBottom('smooth')}
              title="Scroll to bottom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Button>
          )}

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
                placeholder={
                    activeFeature === 'image' ? 'చిత్రాన్ని వివరించండి...' :
                    activeFeature === 'summarize' ? 'సారాంశం కోసం టెక్స్ట్ నమోదు చేయండి...' :
                    activeFeature === 'translate' ? 'అనువాదం కోసం టెక్స్ట్ నమోదు చేయండి...' :
                    'ఏదైనా అడగండి...'
                }
                className="pr-24 min-h-[52px] resize-none rounded-xl border-input bg-card px-4 py-3.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                disabled={isLoading}
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
                <Button type="button" size="icon" variant="ghost" className={cn("transition-colors rounded-full text-muted-foreground", isListening && "text-destructive")} onClick={handleVoiceInput} disabled={isLoading}>
                  <Mic className="h-5 w-5" />
                  <span className="sr-only">Voice Input</span>
                </Button>
                <Button type="submit" size="icon" className="rounded-full w-9 h-9 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading || !input.trim()}>
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
            <p className="text-xs text-center text-muted-foreground">తెలుగు తోడు can make mistakes. Please verify important information.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
