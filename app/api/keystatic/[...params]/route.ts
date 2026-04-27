import { makeRouteHandler } from '@keystatic/next/route-handler';
import keystaticConfig from '../../../../keystatic.config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const { POST, GET } = makeRouteHandler({ config: keystaticConfig });
