export function updateObject<T>(object: T, newProps: Partial<T>, cloneObject: () => T): T {
    if (!newProps || !Object.keys(newProps).length) {
        return object;
    }

    const newObject = cloneObject();
    for (let key in newProps) {
        // @ts-ignore
        newObject[key] = newProps[key];
    }

    return newObject;
}