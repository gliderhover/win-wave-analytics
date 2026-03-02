import { useState, useMemo } from "react";
import { Globe, Check, Search } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { supportedLocales, LocaleCode } from "@/i18n/locales";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useI18n();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return supportedLocales;
    const q = search.toLowerCase();
    return supportedLocales.filter(
      l => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [search]);

  const current = supportedLocales.find(l => l.code === locale);

  return (
    <DropdownMenu open={open} onOpenChange={v => { setOpen(v); if (!v) setSearch(""); }}>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-secondary">
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-xs font-mono">{current?.flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] max-h-[360px] overflow-hidden flex flex-col">
        {/* Search */}
        <div className="flex items-center gap-2 px-2 py-2 border-b border-border">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
        </div>
        {/* List */}
        <div className="overflow-y-auto max-h-[300px]">
          {filtered.map(l => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => { setLocale(l.code as LocaleCode); setOpen(false); }}
              className={cn(
                "flex items-center gap-2 text-xs cursor-pointer",
                locale === l.code && "text-primary font-semibold"
              )}
            >
              <span className="w-5 text-center">{l.flag}</span>
              <span className="flex-1">{l.nativeName}</span>
              {locale === l.code && <Check className="w-3 h-3 text-primary" />}
            </DropdownMenuItem>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">No languages found</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
