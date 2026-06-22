"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { cn } from "@common/utils/cn.util";

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative rounded-md">
        <Input type={showPassword ? "text" : "password"} className={cn("pr-10", className)} ref={ref} {...props} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground bg-muted hover:bg-muted/80 absolute top-0 right-0 h-full w-10 rounded-tl-none rounded-r-md rounded-bl-none"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
