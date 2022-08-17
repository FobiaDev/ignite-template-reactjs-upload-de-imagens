import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

type AddImageFormData = {
  description: string;
  title: string;
  url: string;
};

const formAddImageSchema = Yup.object().shape({
  image: Yup.mixed()
    .test('required', 'Arquivo obrigatório', value => {
      return value.length > 0;
    })
    .test('fileType', 'Somente são aceitos arquivos PNG, JPEG e GIF', value => {
      const SUPPORTED_FORMATS = ['image/jpeg', 'image/gif', 'image/png'];

      return SUPPORTED_FORMATS.includes(value[0]?.type);
    })
    .test('fileSize', 'O arquivo deve ser menor que 10MB', value => {
      const SIZE_IN_BYTES = 10000000; // 10MB

      return value[0]?.size <= SIZE_IN_BYTES;
    }),
  title: Yup.string().required('Título obrigatório').min(2).max(20),
  description: Yup.string().required('Descrição obrigatória').max(65),
});

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async ({ description, title, url }: AddImageFormData) => {
      const response = await api.post('/api/images', {
        description,
        title,
        url,
      });

      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm({
      resolver: yupResolver(formAddImageSchema),
    });
  const { errors } = formState;

  const onSubmit: SubmitHandler<AddImageFormData> = async data => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        mutation.mutateAsync({
          title: data.title,
          description: data.description,
          url: imageUrl,
        });
        toast({
          title: 'Imagem cadastrada',
          description: 'Sua imagem foi cadastrada com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      reset();
      setImageUrl('');
      setLocalImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register('image')}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          {...register('title')}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register('description')}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
