import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface MonthNavigatorProps {
  readonly month: string; // '01' a '12'
  readonly year: string; // '2024', etc
  readonly onChange: (month: string, year: string) => void;
  readonly className?: string;
}

export function MonthNavigator({
  month,
  year,
  onChange,
  className,
}: MonthNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const monthIndex = Number.parseInt(month, 10) - 1;
  const currentYear = Number.parseInt(year, 10);

  const handlePrev = () => {
    let newMonth = monthIndex - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    onChange((newMonth + 1).toString().padStart(2, "0"), newYear.toString());
  };

  const handleNext = () => {
    let newMonth = monthIndex + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    onChange((newMonth + 1).toString().padStart(2, "0"), newYear.toString());
  };

  // Opções combinadas de mês/ano (ex: "Dezembro de 2025")
  const monthYearOptions = useMemo(() => {
    const currentYearNum = new Date().getFullYear();
    const options: Array<{ value: string; label: string }> = [];

    // Criar opções para os últimos 10 anos e próximos 5 anos
    for (let y = currentYearNum - 10; y <= currentYearNum + 5; y++) {
      months.forEach((monthName, index) => {
        const monthValue = (index + 1).toString().padStart(2, "0");
        const value = `${monthValue}-${y}`; // Formato: "12-2025"
        const label = `${monthName} de ${y}`;
        options.push({ value, label });
      });
    }

    return options;
  }, []);

  // Filtrar opções baseado no termo de busca
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return monthYearOptions;
    }
    const term = searchTerm.toLowerCase();
    return monthYearOptions.filter((option) =>
      option.label.toLowerCase().includes(term)
    );
  }, [monthYearOptions, searchTerm]);

  // Valor atual no formato "MM-YYYY"
  const currentValue = useMemo(() => `${month}-${year}`, [month, year]);

  // Label atual
  const currentLabel = useMemo(() => {
    const option = monthYearOptions.find((opt) => opt.value === currentValue);
    return option?.label ?? `${months[monthIndex]} de ${year}`;
  }, [monthYearOptions, currentValue, monthIndex, year]);

  const handleMonthYearChange = (value: string) => {
    const [newMonth, newYear] = value.split("-");
    onChange(newMonth, newYear);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Focar no input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="flex items-center gap-3 bg-white rounded-xl border border-dark-200 dark:bg-dark-900 dark:border-dark-800 px-4 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 dark:hover:shadow-primary-500/20">
        <button
          onClick={handlePrev}
          className="rounded-full bg-dark-100 border border-dark-300 min-h-[44px] min-w-[44px] p-2 hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ease-out hover:scale-110 active:scale-95 flex-shrink-0 flex items-center justify-center dark:bg-dark-800 dark:border-dark-700 dark:hover:bg-dark-700"
          aria-label="Mês anterior"
          type="button"
        >
          <svg
            className="h-5 w-5 text-dark-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex-1 relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full h-11 px-4 rounded-lg bg-dark-100 border border-dark-300 text-dark-900 hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95 flex items-center justify-between dark:bg-dark-800 dark:border-dark-700 dark:text-dark-50 dark:hover:bg-dark-700"
            type="button"
            aria-label="Selecionar mês/ano"
          >
            <span className="text-sm font-medium">{currentLabel}</span>
            <div className="flex items-center gap-2">
              {currentValue && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Não limpar, apenas fechar
                    setIsOpen(false);
                  }}
                  className="p-0.5 rounded hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors"
                  aria-label="Fechar"
                  type="button"
                >
                  <svg
                    className="h-3 w-3 text-dark-500 dark:text-dark-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              <svg
                className={cn(
                  "h-4 w-4 text-dark-400 transition-transform",
                  isOpen && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-dark-200 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden flex flex-col dark:bg-dark-900 dark:border-dark-800">
              <div className="p-2 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar mês/ano..."
                  className="w-full px-2 py-1.5 text-sm bg-dark-50 border border-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-dark-900 placeholder:text-dark-500 dark:bg-dark-800 dark:border-dark-700 dark:text-dark-50 dark:placeholder:text-dark-500"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredOptions.length > 0) {
                      handleMonthYearChange(filteredOptions[0].value);
                    }
                  }}
                />
              </div>
              <div className="overflow-y-auto max-h-56">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = option.value === currentValue;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleMonthYearChange(option.value)}
                        className={cn(
                          "w-full px-3 py-2 text-sm text-left hover:bg-dark-100 focus:bg-dark-100 focus:outline-none transition-colors dark:hover:bg-dark-800 dark:focus:bg-dark-800",
                          isSelected &&
                            "bg-primary-500/20 text-primary-600 dark:text-primary-400"
                        )}
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-dark-500 dark:text-dark-400 text-center">
                    Nenhuma opção encontrada
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          className="rounded-full bg-dark-100 border border-dark-300 min-h-[44px] min-w-[44px] p-2 hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors active:scale-95 flex-shrink-0 flex items-center justify-center dark:bg-dark-800 dark:border-dark-700 dark:hover:bg-dark-700"
          aria-label="Próximo mês"
          type="button"
        >
          <svg
            className="h-5 w-5 text-dark-600 dark:text-dark-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
