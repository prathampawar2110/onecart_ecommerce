// "use client";

// import { useState } from "react";
// import { MessageCircle, X, Send } from "lucide-react";

// export default function ChatBot() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [message, setMessage] = useState("");

//   // Store complete conversation
//   const [messages, setMessages] = useState([]);

//   // Send message to FastAPI
//   const sendMessage = async () => {
//     // Don't send empty message
//     if (!message.trim()) {
//       return;
//     }

//     // Save user's message before clearing input
//     const userMessage = message;

//     // Show user's message
//     setMessages((prev) => [
//       ...prev,
//       {
//         sender: "user",
//         text: userMessage,
//       },
//     ]);

//     // Clear input
//     setMessage("");

//     try {
//       // Send message to FastAPI
//       const res = await fetch("http://127.0.0.1:8000/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           message: userMessage,
//         }),
//       });

//       const data = await res.json();

//       // Show chatbot response
//       setMessages((prev) => [
//         ...prev,
//         {
//           sender: "bot",
//           text: data.response,
//         },
//       ]);
//     } catch (error) {
//       // Show error message
//       setMessages((prev) => [
//         ...prev,
//         {
//           sender: "bot",
//           text: "Sorry, something went wrong.",
//         },
//       ]);
//     }
//   };

//   // Send message when Enter is pressed
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       sendMessage();
//     }
//   };

//   // Closed chatbot button
//   if (!isOpen) {
//     return (
//       <button
//         onClick={() => setIsOpen(true)}
//         className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-xl transition-all duration-200 hover:scale-105"
//       >
//         <MessageCircle size={26} />
//       </button>
//     );
//   }

//   // Open chatbot
//   return (
//     <div className="fixed bottom-6 right-6 z-50 w-90 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">

//       {/* Header */}
//       <div className="flex items-center justify-between bg-black px-5 py-4 text-white">

//         <div>
//           <h2 className="text-sm font-semibold">
//             OneCart Assistant
//           </h2>

//           <p className="mt-0.5 text-xs text-gray-300">
//             Online • Ask me anything
//           </p>
//         </div>

//         <button
//           onClick={() => setIsOpen(false)}
//           className="rounded-full p-1.5 transition hover:bg-white/10 cursor-pointer"
//         >
//           <X size={20} />
//         </button>

//       </div>

//       {/* Chat messages */}
//       <div className="h-90 overflow-y-auto bg-gray-50 p-4">

//         <div className="space-y-3">

//           {/* Initial chatbot message */}
//           <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
//             Hi! 👋
//             <br />
//             How can I help you today?
//           </div>

//           {/* Conversation messages */}
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${
//                 msg.sender === "user"
//                   ? "justify-end"
//                   : "justify-start"
//               }`}
//             >

//               <div
//                 className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
//                   msg.sender === "user"
//                     ? "rounded-tr-sm bg-black text-white"
//                     : "rounded-tl-sm bg-white text-gray-700 shadow-sm"
//                 }`}
//               >
//                 {msg.text}
//               </div>

//             </div>
//           ))}

//         </div>

//       </div>

//       {/* Input */}
//       <div className="border-t bg-white p-3">

//         <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">

//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask about products..."
//             className="min-w-0 flex-1 bg-transparent text-sm outline-none"
//           />

//           <button
//             onClick={sendMessage}
//             className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:scale-105 cursor-pointer"
//           >
//             <Send size={16} />
//           </button>

//         </div>

//       </div>

//     </div>
//   );
// }