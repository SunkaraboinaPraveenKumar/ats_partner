"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { HTMLAttributes, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScriptCopyBtnProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
  value: string;
}

export const ScriptCopyBtn = ({
  text,
  value,
  className,
  ...props
}: ScriptCopyBtnProps) => {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard.");
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Button
        onClick={onCopy}
        className="flex items-center gap-2"
        variant="ghost"
        size="sm"
      >
        {hasCopied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
        {text || "Copy"}
      </Button>
    </div>
  );
};
