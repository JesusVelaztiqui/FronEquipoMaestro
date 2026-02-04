/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Loader from "../components/Loader";

let loaderController = {
  setVisible: null,
  queue: [],
};

export const cargarLoader = () => {
  if (loaderController.setVisible) {
    loaderController.setVisible(true);
  } else {
    loaderController.queue.push(true);
  }
};

export const ocultarLoader = () => {
  if (loaderController.setVisible) {
    loaderController.setVisible(false);
  } else {
    loaderController.queue.push(false);
  }
};

export default function LoaderManager() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loaderController.setVisible = setIsVisible;

    if (loaderController.queue.length > 0) {
      loaderController.queue.forEach((v) => setIsVisible(v));
      loaderController.queue = [];
    }

    return () => {
      loaderController.setVisible = null;
    };
  }, []);

  return ReactDOM.createPortal(<>{isVisible && <Loader />}</>, document.body);
}
