import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import log from 'loglevel';
import { useSelector } from 'react-redux';
import TokenCell from '../token-cell';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenTracker, getTokenInfos } from '../../../hooks/useTokenTracker';
import {
  getAssetImages,
  getShouldHideZeroBalanceTokens,
  getSelectedAddress,
  getAssets,
} from '../../../selectors';
import { getTokens } from '../../../ducks/metamask/metamask';

export default function TokenList({ onTokenClick }) {
  const t = useI18nContext();
  const assetImages = useSelector(getAssetImages);
  const shouldHideZeroBalanceTokens = useSelector(
    getShouldHideZeroBalanceTokens,
  );
  const [tokens, setTokens] = useState([]);
  const [loadingTokenInfos, setLoadingTokenInfos] = useState(false);
  // use `isEqual` comparison function because the token array is serialized
  // from the background so it has a new reference with each background update,
  // even if the tokens haven't changed
  // const tokens = useSelector(getTokens, isEqual);
  const userAddress = useSelector(getSelectedAddress);
  const assets = useSelector(getAssets, isEqual);
  useEffect(() => {
    const fetchData = async () => {
      const currentAssets = assets[userAddress] || undefined;
      if (currentAssets) {
        if (!loadingTokenInfos) {
          setLoadingTokenInfos(true);
          const tokens = await getTokenInfos(currentAssets);
          setLoadingTokenInfos(false);
          setTokens(tokens);
        }
      }
    };
    fetchData();
  }, [userAddress, assets]);

  const { loading, tokensWithBalances } = useTokenTracker(
    tokens,
    true,
    shouldHideZeroBalanceTokens,
  );

  if (loadingTokenInfos || loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '250px',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
        }}
      >
        {t('loadingTokens')}
      </div>
    );
  }

  return (
    <div>
      {tokensWithBalances.map((tokenData, index) => {
        tokenData.image = assetImages[tokenData.code];
        return <TokenCell key={index} {...tokenData} onClick={onTokenClick} />;
      })}
    </div>
  );
}

TokenList.propTypes = {
  onTokenClick: PropTypes.func.isRequired,
};
