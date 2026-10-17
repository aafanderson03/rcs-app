import type { ImageSourcePropType } from 'react-native';

type CompanyBrand = {
  name: string;
  logo: ImageSourcePropType;
};

const defaultBrand: CompanyBrand = {
  name: 'RCS Supermarket',
  logo: require('@/assets/images/brands/rcs-eastern-intertrade.png'),
};

const companyBrands: Record<string, CompanyBrand> = {
  'rcs-eastern-intertrade': defaultBrand,
  'brilliant-distribution': {
    name: 'Brilliant Distribution System',
    logo: require('@/assets/images/brands/brilliant-distribution.png'),
  },
  'tlz-eastland-realty': {
    name: 'TLZ Eastland Realty',
    logo: require('@/assets/images/brands/tlz-eastland-realty.png'),
  },
  'friendship-supermarket': {
    name: 'Friendship Supermarket Inc.',
    logo: require('@/assets/images/brands/friendship-supermarket.png'),
  },
  'metro-federal-steel': {
    name: 'Metro Federal Steel Corp.',
    logo: require('@/assets/images/brands/metro-federal-steel.png'),
  },
  'core-gateway-colleges': {
    name: 'Core Gateway Colleges Inc.',
    logo: require('@/assets/images/brands/core-gateway-colleges.png'),
  },
  'sweetpack-foods': {
    name: 'Sweetpack Foods',
    logo: require('@/assets/images/brands/sweetpack-foods.png'),
  },
};

export function getCompanyBranding(slug?: string, fallbackName?: string): CompanyBrand {
  const brand = slug ? companyBrands[slug] : undefined;
  if (brand) return brand;
  return fallbackName ? { ...defaultBrand, name: fallbackName } : defaultBrand;
}
