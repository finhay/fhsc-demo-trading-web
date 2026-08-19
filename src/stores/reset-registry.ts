type ResettableStore = { getState: () => { resetStore: () => void } };

const resettableStores = new Set<ResettableStore>();

export const registerResettableStore = (store: ResettableStore): void => {
    resettableStores.add(store);
};

export const resetAllStores = (): void => {
    resettableStores.forEach((store) => store.getState().resetStore());
};
