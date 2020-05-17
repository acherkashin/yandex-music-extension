import { lookup as syncLookup } from 'dns';
import { promisify } from 'util';

const lookup = promisify(syncLookup);

export function isOnline(): Promise<boolean> {
    return lookup('google.com')
        .then(() => true)
        .catch((err) => {
            return !(err && err.code === "ENOTFOUND");
        });
}