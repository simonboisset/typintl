import {select, SelectConfig} from './select';

export const plural = <const Config extends SelectConfig>(config: Config) => select('count', config);
