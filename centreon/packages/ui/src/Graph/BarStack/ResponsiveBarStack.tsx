import { useRef } from 'react';

import { BarStack as BarStackVertical, BarStackHorizontal } from '@visx/shape';
import { Group } from '@visx/group';
import numeral from 'numeral';
import { Text } from '@visx/text';
import { useTranslation } from 'react-i18next';

import { Typography } from '@mui/material';

import { Tooltip } from '../../components';
import { LegendProps } from '../Legend/models';
import { Legend as LegendComponent } from '../Legend';
import { getValueByUnit } from '../common/utils';
import { labelNoDataFound } from '../translatedLabels';

import { BarStackProps } from './models';
import { useBarStackStyles } from './BarStack.styles';
import useResponsiveBarStack from './useResponsiveBarStack';

const DefaultLengd = ({ scale, direction }: LegendProps): JSX.Element => (
  <LegendComponent direction={direction} scale={scale} />
);

const BarStack = ({
  title,
  data,
  width,
  height,
  size = 72,
  onSingleBarClick,
  displayLegend = true,
  TooltipContent,
  Legend = DefaultLengd,
  unit = 'number',
  displayValues,
  variant = 'vertical',
  legendDirection = 'column'
}: BarStackProps & { height: number; width: number }): JSX.Element => {
  const { t } = useTranslation();
  const { classes } = useBarStackStyles();

  const titleRef = useRef(null);
  const legendRef = useRef(null);

  const {
    barSize,
    colorScale,
    input,
    keys,
    legendScale,
    total,
    xScale,
    yScale,
    svgWrapperWidth,
    svgContainerSize,
    isVerticalBar,
    areAllValuesNull
  } = useResponsiveBarStack({
    data,
    height,
    legendRef,
    size,
    titleRef,
    unit,
    variant,
    width
  });

  const BarStackComponent = isVerticalBar
    ? BarStackVertical
    : BarStackHorizontal;

  if (areAllValuesNull) {
    return (
      <div className={classes.container} style={{ height, width }}>
        <Typography variant="h3">{t(labelNoDataFound)}</Typography>
      </div>
    );
  }

  return (
    <div className={classes.container} style={{ height, width }}>
      <div
        className={classes.svgWrapper}
        style={{
          height,
          width: svgWrapperWidth
        }}
      >
        {title && (
          <div className={classes.title} data-testid="Title" ref={titleRef}>
            {`${numeral(total).format('0a').toUpperCase()} `} {title}
          </div>
        )}
        <div
          className={classes.svgContainer}
          data-testid="barStack"
          style={svgContainerSize}
        >
          <svg
            data-variant={variant}
            height={barSize.height}
            width={barSize.width}
          >
            <Group>
              <BarStackComponent
                color={colorScale}
                data={[input]}
                keys={keys}
                {...(isVerticalBar
                  ? { x: () => undefined }
                  : { y: () => undefined })}
                xScale={xScale}
                yScale={yScale}
              >
                {(barStacks) =>
                  barStacks.map((barStack) =>
                    barStack.bars.map((bar) => {
                      const onClick = (): void => {
                        onSingleBarClick?.(bar);
                      };

                      return (
                        <Tooltip
                          hasCaret
                          classes={{
                            tooltip: classes.barStackTooltip
                          }}
                          followCursor={false}
                          key={`bar-stack-${barStack.index}-${bar.index}`}
                          label={
                            TooltipContent && (
                              <TooltipContent
                                color={bar.color}
                                label={bar.key}
                                title={title}
                                total={total}
                                value={barStack.bars[0].bar.data[barStack.key]}
                              />
                            )
                          }
                          position={
                            isVerticalBar ? 'right-start' : 'bottom-start'
                          }
                        >
                          <g data-testid={bar.key}>
                            <rect
                              fill={bar.color}
                              height={
                                isVerticalBar ? bar.height - 1 : bar.height
                              }
                              key={`bar-stack-${barStack.index}-${bar.index}`}
                              ry={5}
                              width={isVerticalBar ? bar.width : bar.width - 1}
                              x={bar.x}
                              y={bar.y}
                              onClick={onClick}
                            />
                            {displayValues &&
                              bar.height > 10 &&
                              bar.width > 10 && (
                                <Text
                                  cursor="pointer"
                                  data-testid="value"
                                  fill="#000"
                                  fontSize={12}
                                  textAnchor="middle"
                                  verticalAnchor="middle"
                                  x={bar.x + bar.width / 2}
                                  y={bar.y + bar.height / 2}
                                >
                                  {getValueByUnit({
                                    total,
                                    unit,
                                    value:
                                      barStack.bars[0].bar.data[barStack.key]
                                  })}
                                </Text>
                              )}
                          </g>
                        </Tooltip>
                      );
                    })
                  )
                }
              </BarStackComponent>
            </Group>
          </svg>
        </div>
      </div>
      {displayLegend && (
        <div data-testid="Legend" ref={legendRef}>
          <Legend
            data={data}
            direction={legendDirection}
            scale={legendScale}
            title={title}
            total={total}
            unit={unit}
          />
        </div>
      )}
    </div>
  );
};

export default BarStack;
