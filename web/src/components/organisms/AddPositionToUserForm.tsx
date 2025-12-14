// components/organisms/AddPositionToUserForm.tsx
'use client';

import { AddPositionToUser } from '@/app/actions/user/addPositionToUser';
import { getPositions } from '@/app/actions/position/gets';
import { ReactSelectOption } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { set, z } from 'zod';
import AsyncSelectBox from '../atoms/MyAsyncSelect';
import { useCallback } from 'react';
import { Button } from '../atoms';

const addPositionSchema = z.object({
  positionId: z.string().min(1, 'لطفاً یک نقش انتخاب کنید'),
});

type AddPositionFormData = z.infer<typeof addPositionSchema>;

interface AddPositionToUserFormProps {
  userId: string;
}

export const AddPositionToUserForm = ({
  userId,
}: AddPositionToUserFormProps) => {
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddPositionFormData>({
    resolver: zodResolver(addPositionSchema),
    defaultValues: {
      positionId: '',
    },
  });


  const loadPositionOptions = useCallback(async () => {
    try {
      const result = await getPositions({
        set: { page: 1, limit: 20, filterPositions: "all" },
        get: { _id: 1, name: 1 },
      });
      return result.body?.map((pos: { _id: string; name: string }) => ({
        value: pos._id,
        label: pos.name,
      })) || [];
    } catch (error) {
      return [];
    }
  }, []);

  const onSubmit = async (data: AddPositionFormData) => {
    console.log(data, userId);

    // try {
    //   const response = await AddPositionToUser({
    //     set: {
    //       userId,
    //       positionId: data.positionId,
    //       position: ""
    //     },
    //     get: { _id: 1, first_name: 1, last_name: 1 },
    //   });

    //   if (response.success) {
    //     toast.success('نقش با موفقیت به کاربر اضافه شد');
    //     reset(); // فرم رو کامل ریست کن
    //     onPositionAdded?.();
    //   } else {
    //     toast.error(response.message || 'خطا در افزودن نقش');
    //   }
    // } catch (err) {
    //   toast.error('خطا در ارتباط با سرور');
    // }
  };

  return (
    <div className="flex items-center gap-2 py-5">
      <div className='flex-1'>
        <AsyncSelectBox
          label=""
          name="positionId"
          setValue={setValue}
          loadOptions={loadPositionOptions}
          defaultOptions
        />
      </div>
      <div className='shrink-0'>
        <Button
          type='button'
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          onClick={handleSubmit(onSubmit)}
        >
          <Plus />
          افزودن
        </Button>
      </div>
    </div>
  );
};