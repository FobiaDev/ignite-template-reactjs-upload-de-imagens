import { SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { Card } from './Card';
import { ModalViewImage } from './Modal/ViewImage';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface CardsProps {
  cards: Card[];
}

export function CardList({ cards }: CardsProps): JSX.Element {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const [currentUrl, setCurrentUrl] = useState('');

  const handleViewImage = (url: string) => {
    onOpen();
    setCurrentUrl(url);
  };

  return (
    <>
      <SimpleGrid columns={3} spacing="10" mb="10">
        {cards.map(card => {
          return <Card data={card} key={card.id} viewImage={handleViewImage} />;
        })}
      </SimpleGrid>

      <ModalViewImage imgUrl={currentUrl} isOpen={isOpen} onClose={onClose} />
    </>
  );
}
