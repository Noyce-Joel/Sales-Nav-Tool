"use client";

import React, { useState, useEffect } from "react";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LinkedInCredentialsDialog() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stateChangeCount, setStateChangeCount] = useState(0);

  useEffect(() => {
    const storedCredentials = localStorage.getItem("linkedInCredentials");
    if (storedCredentials) {
      setCredentials(JSON.parse(storedCredentials));
    } else {
      setIsEditing(true);
    }
  }, []);

  useEffect(() => {
    if (stateChangeCount > 0) {

      setStateChangeCount((prev) => prev + 1);
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("linkedInCredentials", JSON.stringify(credentials));
    setIsEditing(false);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
    setStateChangeCount((prev) => prev + 1);
  };

  return (
    <Card className="w-full shadow-none border-none max-w-md mx-auto">
      <CardContent className="p-0">
        <DialogHeader>
          <DialogTitle className="text-2xl p-0 font-semibold flex items-center gap-2 text-primary">
            <div className="w-6 h-6 rounded-xl">
              <Image
                src="/SNIcon.jpg"
                alt="profile"
                width={100}
                height={100}
                style={{ borderRadius: "100%" }}
              />
            </div>
            LinkedIn Credentials
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditing
              ? "Enter your LinkedIn credentials to connect your account."
              : "Your LinkedIn account is connected. You can update your credentials anytime."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence initial={false} mode='wait' >
          <motion.div
            key={isEditing ? "credentials-form" : "credentials-display"}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                duration: 0.4,
                when: stateChangeCount > 0 ? "beforeChildren" : "afterChildren", 
              },
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            {!isEditing && credentials.username && credentials.password ? (
              <motion.div
                key="credentials-display"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="mt-6 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{credentials.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">••••••••</span>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="credentials-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your LinkedIn username"
                      value={credentials.username}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your LinkedIn password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.form>
            )}
          </motion.div>
        </AnimatePresence>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={toggleEditing}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmit}>
                Save Credentials
              </Button>
            </>
          ) : (
            <Button onClick={toggleEditing}>Update Credentials</Button>
          )}
        </DialogFooter>
      </CardContent>
    </Card>
  );
}
