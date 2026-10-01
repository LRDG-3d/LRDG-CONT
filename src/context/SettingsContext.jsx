import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const SettingsContext = createContext(null);
const SETTINGS_DOC = doc(db, "settings", "site");

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      SETTINGS_DOC,
      (snap) => {
        setSettings(snap.exists() ? snap.data() : {});
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  async function updateSettings(updates) {
    await setDoc(SETTINGS_DOC, updates, { merge: true });
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
