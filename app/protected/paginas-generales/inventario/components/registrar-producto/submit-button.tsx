export const SubmitButton = ({ loading }: { loading: boolean }) => {
    return (
      <button
        type="submit"
        className={`bg-primary text-white px-6 py-2 rounded-md ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar Producto"}
      </button>
    );
  };