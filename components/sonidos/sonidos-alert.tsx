import { useEffect, useRef } from "react"


const audioError = () => {
    const audio = new Audio("/assets/error.mp3");
    audio
      .play()
      .catch((error) => console.error("Error al reproducir el audio:", error));
  };

const audioExito = () => {
    const audio = new Audio("/assets/exito.mp3");
    audio
      .play()
      .catch((error) => console.error("Error al reproducir el audio:", error));
  };

  export { audioError,audioExito};