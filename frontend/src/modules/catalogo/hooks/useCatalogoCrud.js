import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const parseError = (error, fallback) => error?.response?.data?.error || fallback;

export const useCatalogoCrud = ({ api, errorMessages, successMessages }) => {
  const [items, setItems] = useState([]);

  const cargar = useCallback(async () => {
    try {
      const data = await api.list();
      setItems(data);
    } catch {
      toast.error(errorMessages.load);
    }
  }, [api, errorMessages.load]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const create = async (payload) => {
    try {
      await api.create(payload);
      toast.success(successMessages.create);
      await cargar();
      return true;
    } catch (error) {
      toast.error(parseError(error, errorMessages.save));
      return false;
    }
  };

  const update = async (id, payload) => {
    try {
      await api.update(id, payload);
      toast.success(successMessages.update);
      await cargar();
      return true;
    } catch (error) {
      toast.error(parseError(error, errorMessages.save));
      return false;
    }
  };

  const remove = async (id, fallbackMessage) => {
    try {
      await api.remove(id);
      toast.success(successMessages.remove);
      await cargar();
      return true;
    } catch (error) {
      toast.error(parseError(error, fallbackMessage || errorMessages.remove));
      return false;
    }
  };

  return { items, cargar, create, update, remove };
};
