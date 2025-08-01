import { HttpEvent, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { BusyService } from '../service/busy-service';
import { inject } from '@angular/core';
import { delay, finalize, of, tap } from 'rxjs';

const cache = new Map<string, HttpEvent<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const busyService = inject(BusyService);

    const generateCacheKey = (url: string, params: HttpParams) :string =>{
        const paramString = params.keys().map(key => `${key}=${params.get(key)}`).join('&');
        return paramString ? `${url}?${paramString}` : url;
    }

    const invalidateCache = (urlPatter: string) => {
        for(const key of cache.keys()){
            if(key.includes(urlPatter)){
                cache.delete(key);
                console.log(`Cache invalidated for: ${key}`);
            }
        }
    }

    const cacheKey = generateCacheKey(req.url, req.params);

    if(req.method.includes('POST') && req.url.includes('/likes')){
        invalidateCache('likes');
    }

    if(req.method.includes('POST') && req.url.includes('/messages')){
        invalidateCache('likes');
    }

    if(req.method.includes('POST') && req.url.includes('/logout')){
        cache.clear();
    }

    if(req.method === 'GET'){
        const cachedResponse = cache.get(cacheKey);
        if(cachedResponse) {
            return of(cachedResponse);
        };
    }

    busyService.busy();

    return next(req).pipe(
        delay(500),
        tap((response: any) => {
            cache.set(cacheKey, response)
        }),
        finalize(() => {
            busyService.idle()
        })
    );
};
