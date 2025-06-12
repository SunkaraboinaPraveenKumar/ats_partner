"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    const mailtoLink = `mailto:sunkaraboinap@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    
    try {
      window.open(mailtoLink, "_blank");
      toast.success("Opening your mail client to send the message.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Failed to open mail client:", error);
      toast.error("Could not open mail client. Please contact us at support@swipeit.com");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Mail className="h-6 w-6 text-primary" /> Get in Touch</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We'd love to hear from you! Please feel free to reach out to us with any questions, feedback, or inquiries.
            </p>
          </section>
          
          <Separator />

          <section>
            <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
            <ul className="text-gray-700 dark:text-gray-300 space-y-2 w-full">
              <li className="flex items-center justify-start gap-2"><Mail className="h-5 w-5 text-primary" /> <strong>Email:</strong> sunkaraboinap@gmail.com</li>
              <li className="flex items-center justify-start gap-2"><Phone className="h-5 w-5 text-primary" /> <strong>Phone:</strong> 9347160766</li>
              <li className="flex items-center justify-start gap-2"><MapPin className="h-5 w-5 text-primary" /> <strong>Address:</strong> JNTUH, Kukatpally</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Clock className="h-6 w-6 text-primary" /> Business Hours</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Monday - Friday: 9:00 AM - 5:00 PM (IST)
            </p>
          </section>

          <Separator />

          <section className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Send className="h-6 w-6 text-primary" /> Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email">Your Email</Label>
                <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
              </div>
              <Button type="submit" className="flex items-center gap-2">
                Send Message
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </section>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground pt-6">
          Please note: Submitting this form will attempt to open your default email client.
        </CardFooter>
      </Card>
    </div>
  );
} 