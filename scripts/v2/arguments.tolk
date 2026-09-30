// Acton 1.2 passes CLI strings as slices; Tolk 1.4 strings are cells.
fun scriptString(value: string): string {
    var parsed: slice;
    try {
        parsed = (value as unknown as cell).beginParse();
    } catch (_e) {
        parsed = value as unknown as slice;
    }
    return beginCell().storeSlice(parsed).endCell() as unknown as string;
}
