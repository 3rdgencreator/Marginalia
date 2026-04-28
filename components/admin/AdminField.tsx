type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
};

export function Field({ label, name, defaultValue, type = 'text', required, placeholder, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 uppercase tracking-widest">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        className="bg-[#2A2A2C] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#9EFF0A] placeholder:text-gray-600"
      />
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  );
}

type TextareaProps = {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
  placeholder?: string;
};

export function Textarea({ label, name, defaultValue, rows = 4, hint, placeholder }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 uppercase tracking-widest">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ''}
        rows={rows}
        placeholder={placeholder}
        className="bg-[#2A2A2C] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#9EFF0A] resize-y placeholder:text-gray-600"
      />
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  );
}

type CheckboxProps = {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
};

export function Checkbox({ label, name, defaultChecked, hint }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="w-4 h-4 accent-[#9EFF0A]"
        />
        <span className="text-sm text-gray-300">{label}</span>
      </label>
      {hint && <p className="text-xs text-gray-600 ml-7">{hint}</p>}
    </div>
  );
}

type SelectProps = {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  hint?: string;
};

export function Select({ label, name, defaultValue, options, hint }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 uppercase tracking-widest">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? ''}
        className="bg-[#2A2A2C] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#9EFF0A]"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-white/5">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
