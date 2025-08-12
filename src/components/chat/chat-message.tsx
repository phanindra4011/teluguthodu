"use client";

import { BotIcon } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Message } from "@/components/chat/chat-view";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { role, content, imageUrl, emotion } = message;
  const isUser = role === "user";
  const isLoading = role === "loading";

  return (
    <div
      className={cn("flex items-start gap-4", isUser ? "justify-end" : "")}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10">
            <BotIcon className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col gap-2 max-w-xl",
          isUser ? "items-end" : "items-start"
        )}
      >
        {emotion && (
          <Badge variant="outline" className="capitalize border-accent/50 bg-accent/10 text-accent-foreground">
            Feeling: {emotion}
          </Badge>
        )}
        <div
          className={cn(
            "p-4 rounded-2xl",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-card rounded-bl-none"
          )}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-2.5 w-2.5 bg-muted-foreground/30 rounded-full animate-pulse [animation-delay:0s]" />
              <Skeleton className="h-2.5 w-2.5 bg-muted-foreground/30 rounded-full animate-pulse [animation-delay:0.2s]" />
              <Skeleton className="h-2.5 w-2.5 bg-muted-foreground/30 rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
          ) : (
            <>
              {content && <p className="text-current leading-relaxed">{content}</p>}
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
        </div>
        
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
           <AvatarFallback className="bg-secondary">
            <UserIcon className="h-5 w-5 text-secondary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
