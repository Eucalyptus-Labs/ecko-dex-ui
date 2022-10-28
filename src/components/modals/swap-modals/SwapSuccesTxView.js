/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useAccountContext, useApplicationContext, usePactContext, useSwapContext } from '../../../contexts';
import { extractDecimal, getDecimalPlaces, reduceBalance } from '../../../utils/reduceBalance';
import reduceToken from '../../../utils/reduceToken';
import { getTokenIconByCode, getTokenName } from '../../../utils/token-utils';
import GameEditionLabel from '../../game-edition-v2/components/GameEditionLabel';
import { AlertIcon, ArrowIcon, ChainIcon, NotificationWarningIcon } from '../../../assets';
import { CHAIN_ID } from '../../../constants/contextConstants';
import Label from '../../shared/Label';
import { FlexContainer } from '../../shared/FlexContainer';
import CopyPopup from '../../shared/CopyPopup';
import CustomDivider from '../../shared/CustomDivider';
import { SuccessViewContainerGE, SuccesViewContainer } from '../TxView';
import RowTokenInfoPrice from '../../shared/RowTokenInfoPrice';
import { commonColors, theme } from '../../../styles/theme';
import styled from 'styled-components';

export const SwapSuccessViewGE = () => {
  const { account } = useAccountContext();

  const pact = usePactContext();
  const swap = useSwapContext();

  return (
    <SuccessViewContainerGE
      containerStyle={{ marginTop: 16 }}
      leftItem={
        <>
          <div className="flex justify-fs align-ce">
            {getTokenIconByCode(swap?.localRes?.result?.data[0]?.token, pact.allTokens)}
            <GameEditionLabel fontSize={32} color="black" fontFamily="syncopate">
              {getDecimalPlaces(extractDecimal(swap?.localRes?.result?.data[0]?.amount))}
            </GameEditionLabel>
          </div>

          <GameEditionLabel color="blue">From</GameEditionLabel>
          <div className="flex justify-fs">
            <GameEditionLabel fontSize={22} color="blue-grey">
              {reduceToken(account.account)}
            </GameEditionLabel>
            <ChainIcon className="chain-icon" />
            <GameEditionLabel fontSize={22} color="blue-grey">
              {swap?.localRes?.metaData?.publicMeta?.chainId}
            </GameEditionLabel>
          </div>
        </>
      }
      rightItem={
        <>
          <div className="flex justify-fs align-ce">
            {getTokenIconByCode(swap?.localRes?.result?.data[1]?.token, pact.allTokens)}
            <GameEditionLabel fontSize={32} color="black" fontFamily="syncopate">
              {getDecimalPlaces(extractDecimal(swap?.localRes?.result?.data[1]?.amount))}
            </GameEditionLabel>
          </div>
          <GameEditionLabel color="blue">To</GameEditionLabel>
          <div className="flex justify-fs">
            <GameEditionLabel fontSize={22} color="blue-grey">
              {reduceToken(account.account)}
            </GameEditionLabel>
            <ChainIcon className="chain-icon" />
            <GameEditionLabel fontSize={22} color="blue-grey">
              {swap?.localRes?.metaData?.publicMeta?.chainId}
            </GameEditionLabel>
          </div>
        </>
      }
      infoItems={[
        {
          label: `${getTokenName(swap?.localRes?.result?.data[0]?.token, pact.allTokens)}/${getTokenName(
            swap?.localRes?.result?.data[1]?.token,
            pact.allTokens
          )}`,
          value: `1 = ${reduceBalance(pact?.computeOut(1), 6)}`,
        },
        {
          label: 'gas cost KDA',
          value: pact.enableGasStation ? (
            <>
              <GameEditionLabel geColor="white" labelStyle={{ marginLeft: 5 }}>
                FREE
              </GameEditionLabel>
            </>
          ) : (
            <GameEditionLabel geColor="white">{(pact.gasConfiguration.gasPrice * swap?.localRes?.gas).toPrecision(4)} KDA</GameEditionLabel>
          ),
        },
      ]}
    />
  );
};

export const SwapSuccessView = ({ loading, sendTransaction, fromValues }) => {
  const { account } = useAccountContext();
  const pact = usePactContext();
  const swap = useSwapContext();
  const { themeMode } = useApplicationContext();

  const SvgContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    margin-right: 8px;
    svg {
      height: 20px;
      width: 20px;
      path {
        fill: ${({ commonColors }) => commonColors.gold}!important;
      }
    }
  `;

  const amountBWithSlippage =
    extractDecimal(swap?.localRes?.result?.data[1]?.amount) - extractDecimal(swap?.localRes?.result?.data[1]?.amount) * pact.slippage;

  return (
    <SuccesViewContainer
      swap={swap}
      loading={loading}
      hideSubtitle
      disableButton={fromValues.amount * reduceBalance(pact?.computeOut(fromValues.amount) / fromValues.amount, 12) < amountBWithSlippage}
      footer={
        fromValues.amount * reduceBalance(pact?.computeOut(fromValues.amount) / fromValues.amount, 12) < amountBWithSlippage && (
          <FlexContainer
            className="w-100 flex"
            gap={4}
            style={{ background: theme(themeMode).colors.white, borderRadius: 10, padding: 10, marginBottom: 24 }}
          >
            <AlertIcon className="mobile-none svg-app-inverted-color" />
            <Label inverted>
              The current price of {getTokenName(swap?.localRes?.result?.data[1]?.token, pact.allTokens)} is below the slippage value
            </Label>
          </FlexContainer>
        )
      }
      onClick={() => {
        sendTransaction();
      }}
    >
      <FlexContainer className="w-100 column" gap={12}>
        {/* DISCLAIMER */}
        {(!pact.allTokens[getTokenName(swap?.localRes?.result?.data[0]?.token, pact.allTokens)].isVerified ||
          !pact.allTokens[getTokenName(swap?.localRes?.result?.data[1]?.token, pact.allTokens)].isVerified) && (
          <FlexContainer className="align-ce justify-sb">
            <SvgContainer commonColors={commonColors}>
              <NotificationWarningIcon />
            </SvgContainer>

            <Label fontSize={12} fontFamily="basier" color={commonColors.gold}>
              This transaction contains unverified tokens. Review the preview information throughly before confirming the transaction.
            </Label>
          </FlexContainer>
        )}
        {/* ACCOUNT */}
        <FlexContainer className="align-ce justify-sb">
          <Label fontSize={13}>Account</Label>
          <Label fontSize={13}>
            <CopyPopup textToCopy={account.account} />
            {reduceToken(account.account)}
          </Label>
        </FlexContainer>
        {/* CHAIN */}
        <FlexContainer className="align-ce justify-sb">
          <Label fontSize={13}>Chain ID</Label>
          <Label fontSize={13}>{CHAIN_ID}</Label>
        </FlexContainer>

        <CustomDivider style={{ margin: '4px 0px' }} />

        <Label>Amount (Estimate)</Label>

        {/* FROM VALUES */}
        <FlexContainer className="align-ce justify-sb">
          <RowTokenInfoPrice
            tokenIcon={getTokenIconByCode(swap?.localRes?.result?.data[0]?.token, pact.allTokens)}
            tokenName={getTokenName(swap?.localRes?.result?.data[0]?.token, pact.allTokens)}
            amount={fromValues ? fromValues.amount : swap?.localRes?.result?.data[0]?.amount}
            tokenPrice={pact.tokensUsdPrice?.[getTokenName(swap?.localRes?.result?.data[0]?.token, pact.allTokens)] || null}
          />
        </FlexContainer>
        <ArrowIcon style={{ marginLeft: 6 }} />
        {/* TO VALUES */}
        <FlexContainer className="align-ce justify-sb">
          <RowTokenInfoPrice
            isEstimated
            tokenIcon={getTokenIconByCode(swap?.localRes?.result?.data[1]?.token, pact.allTokens)}
            tokenName={getTokenName(swap?.localRes?.result?.data[1]?.token, pact.allTokens)}
            amount={
              fromValues
                ? fromValues.amount * reduceBalance(pact?.computeOut(fromValues.amount) / fromValues.amount, 12)
                : swap?.localRes?.result?.data[1]?.amount
            }
            tokenPrice={pact.tokensUsdPrice?.[getTokenName(swap?.localRes?.result?.data[1]?.token, pact.allTokens)] || null}
          />
        </FlexContainer>
        <FlexContainer className="row justify-sb">
          <Label>Ratio</Label>
          <Label fontSize={13}>{`1 ${getTokenName(swap?.localRes?.result?.data[0]?.token, pact.allTokens)} = ${getDecimalPlaces(
            pact?.computeOut(fromValues.amount) / fromValues.amount
          )} ${getTokenName(swap?.localRes?.result?.data[1]?.token, pact.allTokens)}`}</Label>
        </FlexContainer>
      </FlexContainer>
    </SuccesViewContainer>
  );
};
