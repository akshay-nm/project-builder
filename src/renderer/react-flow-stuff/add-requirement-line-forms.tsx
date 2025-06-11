'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { nativeEnum, z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormComponent, FormSubmitButton } from '@/components/form-elements';
import { FormComponentProps } from '@/components/forms/types';
import { AmountInput, amountSchema, DEFAULT_AMOUNT } from '@/components/form-elements/amount-input';
import { QuantityInput, quantitySchema } from '@/components/form-elements/quantity-input';
import { RateInput, rateSchema } from '@/components/form-elements/rate-input';
import { ItemCategorySelectFormField } from '@/components/filters/item-category-filter';
import { ItemCategory, MeasurementUnit } from '@/types';
import { getAmountFromRateAndQuantity } from '@/lib/get-conversion-factor-to-base-unit';
import { AmountCell } from '@/components/table-cells';
import { Matcher } from 'react-day-picker';
import { ItemSelectFormField } from '@/components/filters/item-filter';
import { QueryKey } from '@/query-keys';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { measurementUnitsApi } from '@/api/measurement-units';
import { ItemQuantityInput } from '@/components/form-elements/item-quantity-input';
import { ItemRateInput } from '@/components/form-elements/item-rate-input';
import { conversionsApi } from '@/api/conversions';

const unitRateBasedSubContractRequirementLineSchema = z.object({
  quantity: quantitySchema,
  rate: rateSchema,
  details: z.string(),
});
export const UnitRateBasedSubContractRequirementLineForm = ({
  onSubmit,
  isSubmitting,
}: FormComponentProps<z.infer<typeof unitRateBasedSubContractRequirementLineSchema>>) => {
  const form = useForm<z.infer<typeof unitRateBasedSubContractRequirementLineSchema>>({
    resolver: zodResolver(unitRateBasedSubContractRequirementLineSchema),
  });
  const params = useParams();
  const measurementUnitsQuery = useQuery({
    queryKey: [QueryKey.MEASUREMENT_UNITS, { project: params.project as string }],
    queryFn: () => measurementUnitsApi.get({ project: params.project as string, limit: 1000 }),
  });
  const customUnits = measurementUnitsQuery.data?.data ?? [];

  const [measureType, setMeasureType] = useState<string | null>(null);
  const quantity = useWatch({ control: form.control, name: 'quantity' });
  const rate = useWatch({ control: form.control, name: 'rate' });

  const { data: amount } = useQuery({
    queryKey: [QueryKey.CONVERSION_FACTOR, params.project as string, quantity?.unit, rate?.unit, quantity?.value, rate?.value],
    queryFn: () =>
      conversionsApi.getAmount({
        project: params.project as string,
        quantityUnit: quantity?.unit,
        quantityValue: quantity?.value,
        rateUnit: rate?.unit,
        rateValue: rate?.value,
      }),
  });

  return (
    <Form {...form}>
      <FormComponent onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Additional details" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>Description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <QuantityInput
          name="quantity"
          formDescription="Total quantity depending on the type of work, for example for tile work, the unit should be m2"
          onMeasureTypeChange={(measureType) => setMeasureType(measureType ?? null)}
        />
        <RateInput name="rate" defaultMeasureType={measureType ?? undefined} />
        <div>
          <AmountCell amount={amount} label="Total" />
        </div>

        <FormSubmitButton isSubmitting={isSubmitting} />
      </FormComponent>
    </Form>
  );
};

const lumpsumSubContractRequirementLineSchema = z.object({
  details: z.string(),
  amount: amountSchema,
});
export const LumpsumSubContractRequirementLineForm = ({
  onSubmit,
  isSubmitting,
}: FormComponentProps<z.infer<typeof lumpsumSubContractRequirementLineSchema>>) => {
  const form = useForm<z.infer<typeof lumpsumSubContractRequirementLineSchema>>({
    resolver: zodResolver(lumpsumSubContractRequirementLineSchema),
    defaultValues: {
      amount: DEFAULT_AMOUNT,
    },
  });

  return (
    <Form {...form}>
      <FormComponent onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Additional details" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>Description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <AmountInput name="amount" />

        <FormSubmitButton isSubmitting={isSubmitting} />
      </FormComponent>
    </Form>
  );
};

const tradesmanRequirementLineSchema = z.object({
  trade: z.string(),
  headCount: z.coerce.number(),
  details: z.string(),
  rate: rateSchema,
});

export const TradesmanRequirementLineForm = ({
  onSubmit,
  isSubmitting,
}: FormComponentProps<z.infer<typeof tradesmanRequirementLineSchema>> & { disabledDates?: Matcher }) => {
  const form = useForm<z.infer<typeof tradesmanRequirementLineSchema>>({
    resolver: zodResolver(tradesmanRequirementLineSchema),
  });

  return (
    <Form {...form}>
      <FormComponent onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Controller
          name="trade"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="headCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Head Count</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <RateInput name="rate" defaultMeasureType={'time'} />
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="details" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmitButton
          isSubmitting={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 w-full text-white rounded-md transition-transform duration-200 hover:scale-[1.02]"
        />
      </FormComponent>
    </Form>
  );
};

const formSchema = z.object({
  item: z.any(),
  itemCategory: nativeEnum(ItemCategory),
  quantity: quantitySchema,
  rate: rateSchema,
});

export const ItemRequirementLineForm = ({ onSubmit, isSubmitting }: FormComponentProps<z.infer<typeof formSchema>>) => {
  const params = useParams();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const item = useWatch({ control: form.control, name: 'item' }) as any;
  const itemCategory = useWatch({ control: form.control, name: 'itemCategory' }) as any;

  const quantity = useWatch({ control: form.control, name: 'quantity' });
  const rate = useWatch({ control: form.control, name: 'rate' });

  const measurementUnitsQuery = useQuery({
    queryKey: [QueryKey.MEASUREMENT_UNITS, { project: params.project as string }],
    queryFn: () => measurementUnitsApi.get({ project: params.project as string, limit: 1000 }),
  });
  const customUnits = measurementUnitsQuery.data?.data ?? [];

  const { data: amount } = useQuery({
    queryKey: [QueryKey.CONVERSION_FACTOR, params.project as string, item?.defaultMeasureUnit, rate?.unit, quantity?.value, rate?.value],
    queryFn: () =>
      conversionsApi.getAmount({
        project: params.project as string,
        quantityUnit: item?.defaultMeasureUnit,
        quantityValue: quantity?.value,
        rateUnit: rate?.unit,
        rateValue: rate?.value,
      }),
  });

  useEffect(() => {
    if (item) {
      form.setValue('quantity', {
        value: 0,
        unit: item.defaultMeasureUnit,
      });
      form.setValue('rate', {
        value: 0,
        unit: item.defaultMeasureUnit,
        currency: 'INR',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return (
    <Form {...form}>
      <FormComponent onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ItemCategorySelectFormField name="itemCategory" label="Estimate Category" />
        <ItemSelectFormField itemCategory={itemCategory} />
        <div className="flex justify-between">
          <ItemQuantityInput itemId={item?._id} name="quantity" />
          <ItemRateInput itemId={item?._id} name="rate" />
        </div>
        <div className="my-2">
          <AmountCell amount={amount} label="Total" />
        </div>
        <div>
          <FormSubmitButton
            isSubmitting={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 w-full text-white rounded-md transition-transform duration-200 hover:scale-[1.02]"
          />
        </div>
      </FormComponent>
    </Form>
  );
};
