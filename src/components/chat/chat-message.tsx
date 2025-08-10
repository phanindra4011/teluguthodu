"use client";

import { BotIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Message } from "@/components/chat/chat-view";
import { Button } from "@/components/ui/button";
import { Volume2, UserIcon } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

interface ChatMessageProps {
  message: Message;
  speak: (text: string) => void;
}

export function ChatMessage({ message, speak }: ChatMessageProps) {
  const { role, content, imageUrl, emotion } = message;
  const isUser = role === "user";
  const isLoading = role === "loading";

  return (
    <div
      className={cn("flex items-start gap-4", isUser ? "justify-end" : "")}
    >
      {!isUser && (
        <Avatar className="h-10 w-10 border-2 border-primary/20 shrink-0">
          <AvatarFallback className="bg-primary/10">
            <BotIcon className="h-6 w-6 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {emotion && (
          <Badge variant="outline" className="capitalize border-accent/50 bg-accent/10 text-accent-foreground">
            Feeling: {emotion}
          </Badge>
        )}
        <Card
          className={cn(
            "max-w-xl w-full rounded-2xl",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-card rounded-bl-none"
          )}
        >
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Skeleton className="h-2.5 w-2.5 bg-muted-foreground/30 rounded-full animate-pulse [animation-delay:0s]" />
                <Skeleton className="h-2.5 w-2.5 bg-muted-foreground/30 rounded-full animate-pulse [animation-delay:0.2s]" />
                <Skeleton className="h-2.5 w-2.5 bg-muted-foreground/30 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            ) : (
              <>
                {content && <p className="text-current">{content}</p>}
                {imageUrl && (
                  <div className="mt-2">
                    <Image
                      src={imageUrl}
                      alt="Generated image"
                      width={300}
                      height={300}
                      className="rounded-lg border"
                      data-ai-hint="illustration drawing"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        {!isUser && !isLoading && content && (
           <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground transition-transform active:scale-95"
            onClick={() => speak(content)}
          >
            <Volume2 className="h-5 w-5" />
            <span className="sr-only">Speak</span>
          </Button>
        )}
      </div>
      {isUser && (
        <Avatar className="h-10 w-10 border-2 border-accent/20 shrink-0">
           <AvatarFallback className="bg-accent/10">
            <UserIcon className="h-6 w-6 text-accent" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}