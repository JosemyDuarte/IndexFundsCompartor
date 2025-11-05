import type { PageLoad } from './$types';
import { urlToParams } from '$lib/utils/urlSync';

export const load: PageLoad = ({ url }) => {
	const urlParams = urlToParams(url.search.substring(1));

	return {
		urlParams
	};
};
