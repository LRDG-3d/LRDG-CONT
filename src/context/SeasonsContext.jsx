import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase.js";

const SeasonsContext = createContext(null);

export function SeasonsProvider({ children }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "seasons"), orderBy("number", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const value = docSnap.data();
          const episodes = [...(value.episodes || [])].sort(
            (a, b) => a.number - b.number
          );
          return { id: docSnap.id, ...value, episodes };
        });
        setSeasons(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  async function addSeason({ number, title, synopsis, banner }) {
    await addDoc(collection(db, "seasons"), {
      number,
      title,
      synopsis: synopsis || "",
      banner: banner || "",
      episodes: [],
    });
  }

  async function updateSeason(seasonId, updates) {
    await updateDoc(doc(db, "seasons", seasonId), updates);
  }

  async function deleteSeason(seasonId) {
    await deleteDoc(doc(db, "seasons", seasonId));
  }

  async function addEpisode(seasonId, episode) {
    await updateDoc(doc(db, "seasons", seasonId), {
      episodes: arrayUnion({ id: crypto.randomUUID(), ...episode }),
    });
  }

  async function removeEpisode(seasonId, episode) {
    await updateDoc(doc(db, "seasons", seasonId), {
      episodes: arrayRemove(episode),
    });
  }

  return (
    <SeasonsContext.Provider
      value={{
        seasons,
        loading,
        addSeason,
        updateSeason,
        deleteSeason,
        addEpisode,
        removeEpisode,
      }}
    >
      {children}
    </SeasonsContext.Provider>
  );
}

export function useSeasons() {
  return useContext(SeasonsContext);
}
