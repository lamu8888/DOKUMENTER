import mistDawn from './images/wallace_sulawesi_mist_dawn_1791510261549.jpg';
import maleoBeach from './images/maleo_black_sand_geothermal_1791510275037.jpg';
import nickelMine from './images/nickel_laterite_open_mine_1791510286531.jpg';
import tarsierClose from './images/sulawesi_endemic_tarsier_1791510299205.jpg';

export const IMAGE_ASSETS: Record<string, string> = {
  wallace_sulawesi_mist_dawn: mistDawn,
  maleo_black_sand_geothermal: maleoBeach,
  nickel_laterite_open_mine: nickelMine,
  sulawesi_endemic_tarsier: tarsierClose,
};

export function getShotImage(imageKey?: string, visualTheme?: string): string {
  if (imageKey && IMAGE_ASSETS[imageKey]) {
    return IMAGE_ASSETS[imageKey];
  }
  // Fallbacks based on theme
  if (visualTheme?.includes('maleo') || visualTheme?.includes('nest') || visualTheme?.includes('egg') || visualTheme?.includes('sand') || visualTheme?.includes('chick')) {
    return maleoBeach;
  }
  if (visualTheme?.includes('mine') || visualTheme?.includes('river') || visualTheme?.includes('laterite') || visualTheme?.includes('threat') || visualTheme?.includes('deforestation') || visualTheme?.includes('coral') || visualTheme?.includes('mercury')) {
    return nickelMine;
  }
  if (visualTheme?.includes('tarsier') || visualTheme?.includes('anoa') || visualTheme?.includes('babirusa') || visualTheme?.includes('biodiversity')) {
    return tarsierClose;
  }
  return mistDawn;
}
