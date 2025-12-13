"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { IStore } from "@/core/interface/model/IStore.model";

interface StoreSelectorProps {
    stores: IStore[];
    selectedStore: IStore | null;
    onStoreSelect: (store: IStore) => void;
    loading?: boolean;
}

export function StoreSelector({
    stores,
    selectedStore,
    onStoreSelect,
    loading = false,
}: StoreSelectorProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex-1 justify-between border-0 shadow-none hover:bg-transparent px-4"
                    disabled={loading}
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MapPin size={18} className="text-gray-400 shrink-0" />
                        <span className="text-gray-700 text-sm font-medium truncate">
                            {selectedStore ? selectedStore.district : "Select store"}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search stores..." />
                    <CommandList>
                        <CommandEmpty>No store found.</CommandEmpty>
                        <CommandGroup>
                            {stores.map((store) => (
                                <CommandItem
                                    key={store._id.toString()}
                                    value={`${store.name} ${store.address} ${store.district}`}
                                    onSelect={() => {
                                        onStoreSelect(store);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedStore?._id.toString() === store._id.toString()
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{store.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {store.address}, {store.district}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
