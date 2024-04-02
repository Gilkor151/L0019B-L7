<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>Gammelstad - Polygon</Name>
    <UserStyle>
      <Title>A gold polygon style</Title>
      <FeatureTypeStyle>
        <Rule>
          <Title>gold polygon</Title>
          <Filter>
            <PropertyIsNotEqualTo>
              <PropertyName>BID</PropertyName>
              <Literal></Literal>
            </PropertyIsNotEqualTo>
          </Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#C96563</CssParameter> <!-- Adjusted cooler red color -->
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#C62612</CssParameter> <!-- Adjusted cooler red color -->
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
                    <TextSymbolizer>
            <Label>
              <ogc:PropertyName>BID</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Arial</CssParameter>
              <CssParameter name="font-size">12</CssParameter>
            </Font>
            <Fill>
              <CssParameter name="fill">#000000</CssParameter>
            </Fill>
            <Halo>
              <Radius>1</Radius>
              <Fill>
                <CssParameter name="fill">#FFFFFF</CssParameter>
              </Fill>
            </Halo>
            <LabelPlacement>
              <PointPlacement>
                <AnchorPoint>
                  <AnchorPointX>0.5</AnchorPointX>
                  <AnchorPointY>0.5</AnchorPointY>
                </AnchorPoint>
              </PointPlacement>
            </LabelPlacement>
            <VendorOption name="autoWrap">80</VendorOption>
            <VendorOption name="maxDisplacement">50</VendorOption>
          </TextSymbolizer>
        </Rule>
        <Rule>
          <Title>Other buildings</Title>
          <ElseFilter/>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#6495ED</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#4169E1</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
