import { useEffect, useRef } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";

export const useOrderNotification = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Initialize audio with the tone file from root
    audioRef.current = new Audio("/tone.mpeg");
    
    const user = auth.currentUser;
    if (!user) return;

    // Listen for Pending orders
    const ordersRef = collection(firestore, "orders");
    const q = query(ordersRef, where("status", "==", "Pending"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Don't play sound on the very first load of existing orders
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }

      // If a new document is added or modified to Pending
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New Order Received! Playing sound...");
          playNotification();
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error("Audio play failed (User interaction might be needed):", err);
      });
    }
  };

  return { playNotification };
};