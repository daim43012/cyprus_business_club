import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { page } from '$app/stores';

export function gotoWithRedirectPreserved(href: string) {
	const currentPath = get(page).url.pathname;

	if (href.includes('/login')) {
		document.cookie = `redirectAfterLogin=${currentPath}; path=/; max-age=600; SameSite=Lax`;
	}
console.log('Saving redirectAfterLogin:', currentPath);

	return goto(href);
}
