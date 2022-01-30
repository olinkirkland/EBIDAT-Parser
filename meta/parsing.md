# Sections

## History
https://www.ebidat.de/cgi-bin/ebidat.pl?id=3982

### Data Categories
- Title
  
      h2
- Geschichte
  
      section > article.beschreibung > h3 + p:nth-of-type(1)
- Bauentwicklung
  
      section > article.beschreibung > h3 + p:nth-of-type(2)
- Baubeschreibung
  
      section > article.beschreibung > h3 + p:nth-of-type(3)

## Properties
https://www.ebidat.de/cgi-bin/ebidat.pl?m=h&id=3982

### Data Categories
- Country (Staat)
- State (Bundesland)
- Region
- County (Kreis)
- City/Area (Stadt/Gemeinde)
- Structure Type
- Classification
- Purpose
- Overview (Kurzansprache)
- (Niederungslage)
- (Lagebeschreibung)
- Dating-Begin (Datierung-Beginn)
- Dating-End (Datierung-Ende)
- Condition (Erhaltung - Heutiger Zustand)
- Commentary on Condition

## Physical
https://www.ebidat.de/cgi-bin/ebidat.pl?m=o&id=3982

### Data Categories
- Floorplan (Gesamtgrundriss)
- Bailey (Vorburg)

There are more categories, but it's unclear what they all are or how they're organized. Needs additional research.

## Tourism
https://www.ebidat.de/cgi-bin/ebidat.pl?m=g&id=3982

### Data Categories
- Current Use
- Approach
- Distance to Parking Lot
- Accessibility
- Tours

## References
https://www.ebidat.de/cgi-bin/ebidat.pl?m=n&id=3982

### Data Categories
- Literature

## Image Gallery
Accessible from any page (use History page).
All images are contained in an href in a single div using class '.galerie' with no title.
Captions are contained within the alt text of each image.

article.beschreibung > div.galerie > a.img

## Floor Plan
Accessible from any page (use History page)
Parent div uses class '.gallerie' with an initial h3 element 'Grundriss'

article.beschreibung > div.galerie h3 + img