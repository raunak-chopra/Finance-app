import { View, Text, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

const Card = ({ className, ...props }: ViewProps) => (
    <View
        className={cn(
            "rounded-xl border border-border bg-card shadow-sm",
            className
        )}
        {...props}
    />
);

const CardHeader = ({ className, ...props }: ViewProps) => (
    <View
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
);

const CardTitle = ({ className, ...props }: { className?: string } & any) => ( // Simplified types for RN
    <Text
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight text-card-foreground",
            className
        )}
        {...props}
    />
);

const CardContent = ({ className, ...props }: ViewProps) => (
    <View className={cn("p-6 pt-0", className)} {...props} />
);

const CardFooter = ({ className, ...props }: ViewProps) => (
    <View
        className={cn("flex flex-row items-center p-6 pt-0", className)}
        {...props}
    />
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
